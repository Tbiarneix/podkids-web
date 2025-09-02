import { createAdminClient } from "@/lib/supabase/admin";
import { parsePodcastFeed } from "./parse";

export async function hydratePodcast(podcastId: number) {
  const supabaseAdmin = createAdminClient();

  const { data: podcast, error: podcastErr } = await supabaseAdmin
    .from("podcast")
    .select("id, url")
    .eq("id", podcastId)
    .single();
  if (podcastErr || !podcast?.url) {
    throw new Error(podcastErr?.message || "podcast_not_found_or_no_url");
  }

  const res = await fetch(podcast.url);
  if (!res.ok) {
    throw new Error(`rss_fetch_failed:${res.status}`);
  }
  const xml = await res.text();

  const { meta, episodes } = parsePodcastFeed(xml);

  const metaUpdate: any = {};
  if (meta.name) metaUpdate.name = meta.name;
  if (meta.author) metaUpdate.author = meta.author;
  if (meta.description) metaUpdate.description = meta.description;
  if (meta.cover_url) metaUpdate.cover_url = meta.cover_url;

  if (Object.keys(metaUpdate).length > 0) {
    const { error: updErr } = await supabaseAdmin
      .from("podcast")
      .update(metaUpdate)
      .eq("id", podcastId);
    if (updErr) throw new Error(`podcast_update_failed:${updErr.message}`);
  }

  for (const ep of episodes) {
    const { data: existing, error: findEpErr } = await supabaseAdmin
      .from("episode")
      .select("id")
      .eq("podcast_id", podcastId)
      .eq("url", ep.url)
      .limit(1);
    if (findEpErr) throw new Error(`episode_select_failed:${findEpErr.message}`);

    if (existing && existing.length > 0) {
      continue;
    }

    const insertRow: any = {
      podcast_id: podcastId,
      name: ep.name,
      url: ep.url,
    };
    if (ep.description) insertRow.description = ep.description;
    if (ep.cover) insertRow.cover = ep.cover;
    if (typeof ep.duration === "number") insertRow.duration = ep.duration;
    if (ep.publication_date) insertRow.publication_date = ep.publication_date;

    const { error: insErr } = await supabaseAdmin.from("episode").insert(insertRow);
    if (insErr) throw new Error(`episode_insert_failed:${insErr.message}`);
  }

  const { count, error: countErr } = await supabaseAdmin
    .from("episode")
    .select("id", { count: "exact", head: true })
    .eq("podcast_id", podcastId);
  if (countErr) throw new Error(`episode_count_failed:${countErr.message}`);

  if (typeof count === "number") {
    const { error: updCountErr } = await supabaseAdmin
      .from("podcast")
      .update({ episodes_count: count })
      .eq("id", podcastId);
    if (updCountErr) throw new Error(`podcast_update_count_failed:${updCountErr.message}`);
  }

  return { ok: true, podcastId };
}
