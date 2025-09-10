"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/utils/slugify";
import { Category } from "@/types/podcast";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAudioPlayer } from "@/components/webplayer/AudioPlayerProvider";
import { PodcastSheetHeader } from "@/components/webplayer/PodcastSheetHeader";
import { EpisodesList } from "@/components/webplayer/EpisodesList";
import { useEpisodeStatus } from "@/hooks/useEpisodeStatus";
import { sessionSortKey } from "@/lib/webplayer/episodeStatus";

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

  const [sortAsc, setSortAsc] = useState(false); // false = recent → old (default)
  const [statusFilter, setStatusFilter] = useState<"all" | "unlistened" | "listened">("all");
  const sortedEpisodes = useMemo(() => {
    const copy = [...episodes];
    copy.sort((a, b) => {
      const da = a.publication_date ? new Date(a.publication_date).getTime() : 0;
      const db = b.publication_date ? new Date(b.publication_date).getTime() : 0;
      if (da === db) return 0;
      return sortAsc ? da - db : db - da;
    });
    return copy;
  }, [episodes, sortAsc]);

  const { statuses: episodeStatuses, toggleStatus: toggleEpisodeStatus } = useEpisodeStatus(
    podcast?.id ?? null,
    episodes,
  );

  const filteredEpisodes = useMemo(() => {
    if (statusFilter === "all") return sortedEpisodes;
    return sortedEpisodes.filter((ep) => {
      const st = episodeStatuses[ep.id]?.status ?? "unlistened";
      return statusFilter === "unlistened" ? st !== "listened" : st === "listened";
    });
  }, [sortedEpisodes, statusFilter, episodeStatuses]);

  useEffect(() => {
    try {
      if (!podcast?.id) return;
      const sortKey = sessionSortKey(podcast.id);
      const raw = typeof window !== "undefined" ? localStorage.getItem(sortKey) : null;
      if (raw === null) return;
      setSortAsc(raw === "1");
    } catch {}
  }, [podcast?.id]);

  useEffect(() => {
    try {
      if (!podcast?.id) return;
      const sortKey = sessionSortKey(podcast.id);
      if (typeof window !== "undefined") localStorage.setItem(sortKey, sortAsc ? "1" : "0");
    } catch {}
  }, [podcast?.id, sortAsc]);

  useEffect(() => {
    try {
      if (!podcast?.id) return;
      const key = `webplayer:podcast:${podcast.id}:statusFilter`;
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (!raw) return;
      if (raw === "unlistened" || raw === "listened" || raw === "all") setStatusFilter(raw);
    } catch {}
  }, [podcast?.id]);

  useEffect(() => {
    try {
      if (!podcast?.id) return;
      const key = `webplayer:podcast:${podcast.id}:statusFilter`;
      if (typeof window !== "undefined") localStorage.setItem(key, statusFilter);
    } catch {}
  }, [podcast?.id, statusFilter]);

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
  }, [slug, authorSlug, idFromQuery, supabase]);

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
      <div className="mx-auto max-w-5xl px-4 md:px-6">
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
        <PodcastSheetHeader
          coverSrc={coverSrc}
          podcast={{
            id: podcast.id,
            name: podcast.name,
            author: podcast.author,
            episodes_count: podcast.episodes_count ?? 0,
            description: podcast.description ?? null,
          }}
          categories={categories}
          subscribed={subscribed}
          subLoading={subLoading}
          onToggleSubscribe={async () => {
            const next = !subscribed;
            setSubscribed(next);
            const ok = await toggle(next);
            if (!ok) setSubscribed(!next);
          }}
          sortAsc={sortAsc}
          onToggleSort={() => setSortAsc((v) => !v)}
          statusFilter={statusFilter}
          onChangeStatusFilter={setStatusFilter}
        />

        <div className="mt-8">
          <EpisodesList
            episodes={filteredEpisodes}
            coverFallback={coverSrc}
            podcastName={podcast.name}
            statuses={episodeStatuses}
            onToggleStatus={toggleEpisodeStatus}
            onPlay={(payload) => {
              play(payload);
            }}
          />
        </div>
      </div>
    </div>
  );
}
