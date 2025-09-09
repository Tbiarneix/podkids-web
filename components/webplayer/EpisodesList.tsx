"use client";

import Image from "next/image";
import { sanitizeHtml } from "@/utils/sanitize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  statuses?: Record<
    number,
    { status: "unlistened" | "listening" | "listened"; progress?: number | null }
  >;
  onToggleStatus?: (episodeId: number, nextStatus: "unlistened" | "listened") => void;
  onPlay: (payload: {
    id: number;
    name: string;
    url: string;
    cover: string;
    podcastName: string;
    duration: number | null;
  }) => void;
};

function formatRemaining(
  durationSec: number | null | undefined,
  progressSec: number | null | undefined,
) {
  const d = Math.max(0, Math.floor(Number(durationSec ?? 0)));
  const p = Math.max(0, Math.floor(Number(progressSec ?? 0)));
  const remain = Math.max(0, d - p);
  const h = Math.floor(remain / 3600);
  const m = Math.floor((remain % 3600) / 60);
  const s = remain % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function statusBadge(status?: "unlistened" | "listening" | "listened") {
  const label =
    status === "listened" ? "Écouté" : status === "listening" ? "En cours" : "Non écouté";
  const cls =
    status === "listened"
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : status === "listening"
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
        : "bg-white/10 text-white border-white/20";
  return (
    <Badge variant="outline" className={cn("inline-flex h-8 items-center px-3 text-xs", cls)}>
      {label}
    </Badge>
  );
}

export function EpisodesList({
  episodes,
  coverFallback,
  podcastName,
  statuses,
  onToggleStatus,
  onPlay,
}: EpisodesListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {episodes.map((ep) => {
        const epCover = ep.cover
          ? `/api/image-proxy?src=${encodeURIComponent(ep.cover)}`
          : coverFallback;
        const audioSrc = `/api/audio-proxy?src=${encodeURIComponent(ep.url)}`;
        const st = statuses?.[ep.id]?.status ?? "unlistened";
        const progress = statuses?.[ep.id]?.progress ?? 0;
        const remaining = formatRemaining(ep.duration ?? null, progress);
        const nextToggle = st === "listened" ? "unlistened" : "listened";
        return (
          <li
            key={ep.id}
            className="group relative rounded-2xl border bg-card/95 p-4 text-card-foreground shadow-sm"
          >
            <div>
              <div className="flex w-full items-start gap-4">
                <div className="relative mt-2 h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={epCover}
                    alt=""
                    role="presentation"
                    width={80}
                    height={80}
                    className="z-0 h-full w-full object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    title="Lecture"
                    aria-label="Lecture"
                    className="absolute inset-0 z-10 flex items-center justify-center opacity-100 transition-opacity duration-200 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-yellow-400 bg-background text-yellow-400 transition-all duration-200 md:group-hover:h-14 md:group-hover:w-14">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-7 w-7 md:h-10 md:w-10 md:group-hover:h-12 md:group-hover:w-12"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="sr-only">Lire</span>
                    </span>
                  </button>
                </div>
                <div className="min-w-0 flex-1 basis-0 overflow-hidden">
                  <h3 className="mb-2 max-w-full text-base font-semibold sm:text-lg">{ep.name}</h3>
                  {ep.description ? (
                    <div
                      className="whitespace-normal break-words text-sm [&_*]:max-w-full [&_*]:overflow-hidden [&_*]:whitespace-normal [&_*]:break-words [&_img]:block [&_img]:h-auto [&_img]:max-w-full"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(ep.description)) }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:justify-end">
                {statusBadge(st)}
                {st !== "listened" ? (
                  <Badge
                    variant="outline"
                    className="inline-flex h-8 items-center border-white/20 bg-white/10 px-3 text-xs text-white"
                  >
                    {remaining} {st === "listening" ? "restant" : null}
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleStatus?.(ep.id, nextToggle);
                  }}
                >
                  {st === "listened" ? "Marquer comme non écouté" : "Marquer comme écouté"}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
