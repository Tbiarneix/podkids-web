"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type RecentItem = {
  id: number;
  episode_name: string;
  episode_cover: string | null;
  episode_url: string;
  duration: number | null;
  podcast_id: number | null;
  podcast_name: string | null;
  podcast_cover: string | null;
  last_update: string;
};

export default function LastPlayed() {
  const [items, setItems] = useState<RecentItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  console.log("items", items, list);
  if (error) return null;
  if (items && list.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Reprendre l&apos;écoute</h2>
      {items == null ? (
        <div className="text-muted-foreground text-sm">Chargement…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {list.map((it) => {
            const coverRaw = it.episode_cover || it.podcast_cover || "/images/Logo.webp";
            const cover = coverRaw
              ? `/api/image-proxy?src=${encodeURIComponent(coverRaw)}`
              : "/images/Logo.webp";
            return (
              <div key={`${it.id}-${it.last_update}`} className="flex flex-col">
                <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl">
                  <Image
                    src={cover}
                    alt=""
                    role="presentation"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
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
