"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/components/webplayer/AudioPlayerProvider";

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
  const count = Math.max(1, displayed.length);
  const gapPx = 16;
  const itemWidth = `calc((100% - ${(count - 1) * gapPx}px) / ${count})`;
  if (error) return null;
  if (items && list.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="mb-4 text-2xl font-bold">Reprendre l&apos;écoute</h2>
      {items == null ? (
        <div className="text-muted-foreground text-sm">Chargement…</div>
      ) : (
        <div className="flex w-full flex-row items-stretch gap-4">
          {displayed.map((it) => {
            const coverRaw = it.episode_cover || it.podcast_cover || "/images/Logo.webp";
            const cover = coverRaw
              ? `/api/image-proxy?src=${encodeURIComponent(coverRaw)}`
              : "/images/Logo.webp";
            const audioSrc = `/api/audio-proxy?src=${encodeURIComponent(it.episode_url)}`;
            return (
              <div
                key={`${it.id}-${it.last_update}`}
                className="flex min-w-0 flex-col"
                style={{ flex: `0 0 ${itemWidth}`, maxWidth: itemWidth }}
              >
                <EpisodeCoverWithPlay
                  cover={cover}
                  onPlay={() => {
                    try {
                      // Start playback
                      player.play({
                        id: it.id,
                        name: it.episode_name,
                        url: audioSrc,
                        cover,
                        podcastName: it.podcast_name ?? undefined,
                        duration: it.duration ?? null,
                      });
                      const prog = Math.max(0, Math.floor(Number(it.progress ?? 0)));
                      if (prog > 0) {
                        setTimeout(() => player.seekTo(prog), 60);
                      }
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

function EpisodeCoverWithPlay({
  cover,
  onPlay,
}: {
  cover: string;
  onPlay: () => void;
}) {
  return (
    <div className="group relative mb-2 aspect-square w-full overflow-hidden rounded-xl">
      <Image
        src={cover}
        alt=""
        role="presentation"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover"
        unoptimized
      />
      <button
        type="button"
        title="Lecture"
        aria-label="Lecture"
        className="absolute left-1/2 top-1/2 z-10 grid aspect-square h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-yellow-400 bg-background/80 text-yellow-400 shadow-lg backdrop-blur transition-opacity duration-200 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPlay();
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="sr-only">Lire</span>
      </button>
    </div>
  );
}
