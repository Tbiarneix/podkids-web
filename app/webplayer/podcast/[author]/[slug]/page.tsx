"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { sanitizeHtml } from "@/utils/sanitize";
import { slugify } from "@/utils/slugify";
import { cn } from "@/lib/utils";
import { Category } from "@/types/podcast";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAudioPlayer } from "@/components/webplayer/AudioPlayerProvider";

type PodcastRow = any;

type EpisodeRow = {
  id: number;
  name: string;
  description?: string | null;
  cover?: string | null;
  url: string;
  duration?: number | null;
  publication_date?: string | null;
};

const labelByKey: Record<string, string> = Object.fromEntries(
  Object.entries(Category).map(([k, v]) => [k, v as string]),
) as Record<string, string>;

const toLabel = (value: string): string => labelByKey[value] ?? value;

export default function PodcastDetailsPage() {
  const params = useParams<{ author: string; slug: string }>();
  const searchParams = useSearchParams();
  const idFromQuery = searchParams?.get("id") ?? undefined;
  const slug = slugify(decodeURIComponent(String(params?.slug ?? "")));
  const authorSlug = slugify(decodeURIComponent(String(params?.author ?? "")));

  const supabase = useMemo(() => createClient(), []);
  const { active } = useActiveProfile();
  const { play } = useAudioPlayer();

  const [podcast, setPodcast] = useState<PodcastRow | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const { toggle, loading: subLoading } = useSubscription(podcast?.id);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let match: any | undefined;

        if (idFromQuery) {
          const { data: byId } = await supabase
            .from("podcast")
            .select("id, name, author, cover_url, categories, episodes_count, description")
            .eq("id", idFromQuery)
            .maybeSingle();
          if (byId) {
            match = byId;
          }
        }

        if (!match) {
          const { data: list } = await supabase
            .from("podcast")
            .select("id, name, author, cover_url, categories, episodes_count, description");
          const items = list ?? [];
          if (process.env.NODE_ENV !== "production") {
            console.debug("[PodcastDetail] Params:", { authorSlug, slug, idFromQuery });
            console.debug("[PodcastDetail] Items count:", items.length);
          }
          match = (items as any[]).find(
            (p) => slugify(p.name) === slug && slugify(p.author) === authorSlug,
          );
          const byName = (items as any[]).filter((p) => slugify(p.name) === slug);
          if (!match && byName.length > 0) {
            match =
              byName.find((p) => slugify(p.author) === authorSlug) ??
              byName.find((p) => slugify(p.author).startsWith(authorSlug)) ??
              byName.find((p) => slugify(p.author).includes(authorSlug)) ??
              (byName.length === 1 ? byName[0] : undefined);
          }
        }
        if (!match) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[PodcastDetail] No podcast matched for", {
              authorSlug,
              slug,
              idFromQuery,
            });
          }
          return;
        }
        if (!active) return;
        setPodcast(match);

        const { data: eps } = await supabase
          .from("episode")
          .select("id, name, description, cover, url, duration, publication_date")
          .eq("podcast_id", match.id)
          .order("publication_date", { ascending: false });

        if (!active) return;
        setEpisodes((eps ?? []) as EpisodeRow[]);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (slug && authorSlug) load();
    return () => {
      active = false;
    };
  }, [slug, authorSlug, supabase]);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        if (!podcast?.id || !active?.id) return;
        const profileId = Number(active.id);
        if (Number.isNaN(profileId)) return;
        const { data, error } = await supabase
          .from("podcast_subscriptions")
          .select("profile_id")
          .eq("profile_id", profileId)
          .eq("podcast_id", podcast.id)
          .limit(1);
        if (!mounted) return;
        if (error) return;
        setSubscribed(!!(Array.isArray(data) && data.length > 0));
      } catch {}
    };
    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [podcast?.id, active?.id, supabase]);

  const direct =
    podcast?.cover_url && String(podcast.cover_url).trim() !== ""
      ? String(podcast.cover_url).trim()
      : "";
  const coverSrc = direct
    ? `/api/image-proxy?src=${encodeURIComponent(direct)}`
    : "/images/Logo.webp";

  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse text-white/70">Chargement…</div>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-white/80">Podcast introuvable.</p>
          <div className="mt-4">
            <Link href="/webplayer" className="text-yellow-400 hover:underline">
              Retour au Webplayer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categories: string[] = Array.isArray(podcast.categories)
    ? (podcast.categories as string[]).map((c) => toLabel(c))
    : [];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl sm:px-6">
        <div className="mb-12">
          <Link
            href="/webplayer"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Retour à la liste des podcasts</span>
          </Link>
        </div>
        <div className={cn("relative flex items-start gap-6 p-0")}>
          <button
            type="button"
            aria-label={subscribed ? "Se désabonner" : "S'abonner"}
            title={subscribed ? "Se désabonner" : "S'abonner"}
            aria-pressed={subscribed}
            className={cn(
              "absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full",
              "text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            disabled={subLoading}
            onClick={async () => {
              const next = !subscribed;
              setSubscribed(next);
              const ok = await toggle(next);
              if (!ok) setSubscribed(!next);
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill={subscribed ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="sr-only">{subscribed ? "Se désabonner" : "S'abonner"}</span>
          </button>

          <div className="shrink-0">
            <Image
              src={coverSrc}
              alt={podcast.name}
              width={128}
              height={128}
              className="h-32 w-32 rounded-xl object-cover sm:h-40 sm:w-40"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">{podcast.name}</h1>
            <p className="text-muted-foreground mt-1 truncate text-sm sm:text-base">
              {podcast.author} <span className="mx-1">•</span> {Number(podcast.episodes_count || 0)}{" "}
              épisodes
            </p>
            {podcast.description ? (
              <div
                className="text-muted-foreground mt-3 space-y-2 text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(podcast.description)) }}
              />
            ) : null}

            {categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border-2 border-yellow-400 px-3 py-1 text-sm font-semibold text-yellow-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Épisodes</h2>
          <ul className="flex flex-col gap-4">
            {episodes.map((ep) => {
              const epCover = ep.cover
                ? `/api/image-proxy?src=${encodeURIComponent(ep.cover)}`
                : coverSrc;
              const audioSrc = `/api/audio-proxy?src=${encodeURIComponent(ep.url)}`;
              return (
                <li
                  key={ep.id}
                  className="relative flex items-start gap-4 rounded-2xl border bg-card/95 p-4 text-card-foreground shadow-sm"
                >
                  <div className="absolute right-4 top-4 flex items-center">
                    <button
                      type="button"
                      title="Ajouter à une playlist"
                      aria-label="Ajouter à une playlist"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span className="sr-only">Ajouter à une playlist</span>
                    </button>
                    <button
                      type="button"
                      title="Lecture"
                      aria-label="Lecture"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        play({
                          id: ep.id,
                          name: ep.name,
                          url: audioSrc,
                          cover: epCover,
                          podcastName: podcast.name,
                          duration: ep.duration ?? null,
                        });
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="sr-only">Lire</span>
                    </button>
                  </div>
                  <Image
                    src={epCover}
                    alt={ep.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold sm:text-lg">{ep.name}</h3>
                    {ep.description ? (
                      <div
                        className="text-muted-foreground mt-1 space-y-2 text-sm"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(ep.description)) }}
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
