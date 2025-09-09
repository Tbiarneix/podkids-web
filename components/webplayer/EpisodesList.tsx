"use client";

import Image from "next/image";
import { sanitizeHtml } from "@/utils/sanitize";

export type EpisodeItem = {
  id: number;
  name: string;
  description?: string | null;
  cover?: string | null;
  url: string;
  duration?: number | null;
  publication_date?: string | null;
};

type EpisodesListProps = {
  episodes: EpisodeItem[];
  coverFallback: string;
  podcastName: string;
  onPlay: (payload: {
    id: number;
    name: string;
    url: string;
    cover: string;
    podcastName: string;
    duration: number | null;
  }) => void;
};

export function EpisodesList({ episodes, coverFallback, podcastName, onPlay }: EpisodesListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {episodes.map((ep) => {
        const epCover = ep.cover ? `/api/image-proxy?src=${encodeURIComponent(ep.cover)}` : coverFallback;
        const audioSrc = `/api/audio-proxy?src=${encodeURIComponent(ep.url)}`;
        return (
          <li
            key={ep.id}
            className="group relative flex items-start gap-4 rounded-2xl border bg-card/95 p-4 text-card-foreground shadow-sm"
          >
            <div className="absolute right-4 top-4 flex items-center">{/* Placeholder for actions */}</div>
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={epCover}
                alt={ep.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                unoptimized
              />
              <button
                type="button"
                title="Lecture"
                aria-label="Lecture"
                className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-200 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay({
                    id: ep.id,
                    name: ep.name,
                    url: audioSrc,
                    cover: epCover,
                    podcastName,
                    duration: ep.duration ?? null,
                  });
                }}
              >
                <span className="inline-flex items-center justify-center rounded-full bg-black/60 text-yellow-400 h-10 w-10 md:h-10 md:w-10 md:group-hover:h-14 md:group-hover:w-14 transition-all duration-200">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 md:h-8 md:w-8 md:group-hover:h-10 md:group-hover:w-10" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="sr-only">Lire</span>
                </span>
              </button>
            </div>
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
  );
}
