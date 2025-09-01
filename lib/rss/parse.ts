import { XMLParser } from "fast-xml-parser";

export interface ParsedPodcastMeta {
  name?: string;
  author?: string;
  description?: string;
  cover_url?: string;
}

export interface ParsedEpisode {
  name: string;
  description?: string;
  cover?: string;
  url: string; // audio url
  duration?: number; // seconds
  publication_date?: string; // ISO date (YYYY-MM-DD)
}

function toISODate(d?: string | number | Date): string | undefined {
  if (!d) return undefined;
  const date = new Date(d);
  if (isNaN(date.getTime())) return undefined;
  // Return only the date component as YYYY-MM-DD for Postgres date
  return date.toISOString().slice(0, 10);
}

export function parseDurationToSeconds(value?: string | number): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return Math.max(0, Math.floor(value));
  const s = String(value).trim();
  if (!s) return undefined;
  if (/^\d+$/.test(s)) return Math.max(0, parseInt(s, 10));
  const parts = s.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) return undefined;
  while (parts.length < 3) parts.unshift(0); // to [hh, mm, ss]
  const [hh, mm, ss] = parts;
  return hh * 3600 + mm * 60 + ss;
}

export function parsePodcastFeed(xmlText: string): { meta: ParsedPodcastMeta; episodes: ParsedEpisode[] } {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    // preserve order not needed; we target common fields
  });
  const json = parser.parse(xmlText);

  // Try known roots: rss/channel, feed (atom)
  const channel = (json && json.rss && json.rss.channel) || (json && json.feed); // atom uses feed

  const getPath = (obj: any, path: string[]): any => {
    let cur = obj;
    for (const k of path) {
      if (!cur) return undefined;
      cur = cur[k];
    }
    return cur;
  };
  const pickFirst = (...vals: any[]) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== "");

  const title = pickFirst(channel && channel.title, getPath(channel, ["itunes:title"]));
  const author = pickFirst(
    getPath(channel, ["itunes:author"]),
    getPath(channel, ["author", "name"]),
    typeof (channel && channel.author) === "string" ? channel.author : undefined
  );
  const description = pickFirst(
    getPath(channel, ["itunes:summary"]),
    channel && channel.description,
    channel && channel.subtitle,
    getPath(channel, ["itunes:subtitle"])
  );

  let cover: string | undefined = pickFirst(
    getPath(channel, ["itunes:image", "@_href"]),
    getPath(channel, ["image", "url"])
  );

  const items: any[] = Array.isArray(channel?.item)
    ? channel.item
    : channel?.item
    ? [channel.item]
    : Array.isArray(channel?.entry)
    ? channel.entry
    : [];

  const episodes: ParsedEpisode[] = [];
  for (const item of items) {
    const epTitle = pickFirst(item && item.title);
    const enclosureUrl = pickFirst(getPath(item, ["enclosure", "@_url"]), getPath(item, ["enclosure", "url"]));

    // Some feeds put audio URL in links with rel="enclosure"
    let linkAudio: string | undefined;
    if (!enclosureUrl && Array.isArray(item && item.link)) {
      const enc = (item as any).link.find(
        (l: any) => l && l["@_rel"] === "enclosure" && ((l["@_type"] && String(l["@_type"]).includes("audio")) || !!l["@_href"]) 
      );
      linkAudio = enc && enc["@_href"];
    } else if (!enclosureUrl && getPath(item, ["link", "@_rel"]) === "enclosure") {
      // single link object
      linkAudio = getPath(item, ["link", "@_href"]);
    }

    const audioUrl = pickFirst(enclosureUrl, linkAudio);
    if (!epTitle || !audioUrl) continue; // skip if essential fields missing

    const epDescription = pickFirst(getPath(item, ["itunes:summary"]), item && item.description, item && item.summary);

    const epImage = pickFirst(getPath(item, ["itunes:image", "@_href"]), getPath(item, ["image", "url"]), cover);

    const durationSeconds = parseDurationToSeconds(pickFirst(getPath(item, ["itunes:duration"]), item && item.duration));

    const pubDate = pickFirst(item && item.pubDate, item && item.published, item && item.updated, item && item.date);

    episodes.push({
      name: String(epTitle).trim(),
      description: epDescription ? String(epDescription).trim() : undefined,
      cover: epImage ? String(epImage) : undefined,
      url: String(audioUrl),
      duration: durationSeconds,
      publication_date: toISODate(pubDate),
    });
  }

  const meta: ParsedPodcastMeta = {
    name: title ? String(title).trim() : undefined,
    author: author ? String(author).trim() : undefined,
    description: description ? String(description).trim() : undefined,
    cover_url: cover ? String(cover) : undefined,
  };

  return { meta, episodes };
}
