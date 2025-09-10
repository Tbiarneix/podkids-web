"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/components/webplayer/AudioPlayerProvider";
import { EpisodeCoverWithPlay } from "@/components/webplayer/EpisodeCoverWithPlay";

type RecentItem = {
  id: number;
  episode_name: string;
  episode_cover: string | null;
  episode_url: string;
  duration: number | null;
  podcast_id: number | null;
  podcast_name: string | null;
  podcast_cover: string | null;
  progress?: number | null;
  last_update: string;
};

export default function LastPlayed() {
  const [items, setItems] = useState<RecentItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = useAudioPlayer();

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      try {
        const res = await fetch("/api/episode-status/recent", { cache: "no-store" });
        if (!res.ok) throw new Error("request_failed");
        const json = await res.json();
        if (!aborted) setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Erreur");
      }
    };
    load();
    return () => {
      aborted = true;
    };
  }, []);

  const list = Array.isArray(items) ? items : [];
  const [maxItems, setMaxItems] = useState<number>(5);

  useEffect(() => {
    const compute = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth || 0;
      if (w < 520) setMaxItems(2);
      else if (w < 768) setMaxItems(3);
      else if (w < 1080) setMaxItems(4);
      else setMaxItems(5);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const displayed = list.slice(0, maxItems);
  const skeletonCount = maxItems;
  const [minDelayDone, setMinDelayDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(id);
  }, []);
  const isLoading = items == null || !minDelayDone;
  const count = isLoading ? skeletonCount : Math.max(1, displayed.length);
  const gapPx = 16;
  const itemWidth = `calc((100% - ${(count - 1) * gapPx}px) / ${count})`;

  if (error) return null;
  if (items && list.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="mb-4 text-2xl font-bold">Reprendre l&apos;écoute</h2>
      {isLoading ? (
        <div className="flex w-full flex-row items-stretch gap-4">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={`sk-${idx}`}
              className="flex min-w-0 flex-col"
              style={{ flex: `0 0 ${itemWidth}`, maxWidth: itemWidth }}
            >
              <div className="relative aspect-square w-full animate-pulse overflow-hidden rounded-xl bg-foreground/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-row items-stretch gap-4">
          {displayed.map((it) => {
            const coverRaw = it.episode_cover || it.podcast_cover || "/images/Logo.webp";
            const cover = coverRaw
              ? `/api/image-proxy?src=${encodeURIComponent(coverRaw)}`
              : "/images/Logo.webp";
            const audioSrc = `/api/audio-proxy?src=${encodeURIComponent(it.episode_url)}`;
            const isCurrent = Number(player.current?.id) === Number(it.id);
            const isActive = !!player.playing && isCurrent;
            return (
              <div
                key={`${it.id}-${it.last_update}`}
                className="flex min-w-0 flex-col"
                style={{ flex: `0 0 ${itemWidth}`, maxWidth: itemWidth }}
              >
                <EpisodeCoverWithPlay
                  cover={cover}
                  isActive={isActive}
                  isCurrent={isCurrent}
                  episodeName={it.episode_name}
                  onPlay={() => {
                    try {
                      const index = list.findIndex((x) => Number(x.id) === Number(it.id));
                      const nextList = index >= 0 ? list.slice(index + 1) : [];
                      const nextQueue = nextList.map((e) => {
                        const eCoverRaw = e.episode_cover || e.podcast_cover || "/images/Logo.webp";
                        const eCover = eCoverRaw
                          ? `/api/image-proxy?src=${encodeURIComponent(eCoverRaw)}`
                          : "/images/Logo.webp";
                        const eUrl = `/api/audio-proxy?src=${encodeURIComponent(e.episode_url)}`;
                        return {
                          id: e.id,
                          name: e.episode_name,
                          url: eUrl,
                          cover: eCover,
                          podcastName: e.podcast_name ?? undefined,
                          duration: e.duration ?? null,
                          startAt: Math.max(0, Math.floor(Number(e.progress ?? 0))) || 0,
                        };
                      });

                      player.playNow(
                        {
                          id: it.id,
                          name: it.episode_name,
                          url: audioSrc,
                          cover,
                          podcastName: it.podcast_name ?? undefined,
                          duration: it.duration ?? null,
                          startAt: Math.max(0, Math.floor(Number(it.progress ?? 0))) || 0,
                        },
                        nextQueue,
                      );
                      // Fallback seek remains in place in case of race timing on first play
                      const prog = Math.max(0, Math.floor(Number(it.progress ?? 0)));
                      if (prog > 0) setTimeout(() => player.seekTo(prog), 60);
                    } catch {}
                  }}
                  onToggle={() => {
                    try {
                      player.toggle();
                    } catch {}
                  }}
                />
                <Image
                  src={cover}
                  alt=""
                  role="presentation"
                  width={0}
                  height={0}
                  className="hidden"
                />
                <div className="min-w-0">
                  <div className="text-muted-foreground truncate text-sm">
                    {it.podcast_name ?? "Podcast"}
                  </div>
                  <div className="truncate text-base font-medium">{it.episode_name}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
