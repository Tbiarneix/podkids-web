"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusFilter } from "@/components/webplayer/StatusFilter";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/utils/sanitize";

type PodcastSheetHeaderProps = {
  coverSrc: string;
  podcast: {
    id: number;
    name: string;
    author?: string | null;
    episodes_count?: number | null;
    description?: string | null;
  };
  categories: string[];
  subscribed: boolean;
  subLoading: boolean;
  onToggleSubscribe: () => void;
  sortAsc: boolean;
  onToggleSort: () => void;
  statusFilter?: "all" | "unlistened" | "listened";
  onChangeStatusFilter?: (value: "all" | "unlistened" | "listened") => void;
};

export function PodcastSheetHeader(props: PodcastSheetHeaderProps) {
  const {
    coverSrc,
    podcast,
    categories,
    subscribed,
    subLoading,
    onToggleSubscribe,
    sortAsc,
    onToggleSort,
    statusFilter = "all",
    onChangeStatusFilter,
  } = props;

  return (
    <>
      <div className={cn("relative flex items-start gap-6 p-0")}>
        <button
          type="button"
          aria-label={subscribed ? "Se désabonner" : "S'abonner"}
          title={subscribed ? "Se désabonner" : "S'abonner"}
          aria-pressed={subscribed}
          className={cn(
            "absolute right-0 top-0 hidden h-10 w-10 items-center justify-center rounded-full md:inline-flex",
            "text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          disabled={subLoading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSubscribe();
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
          <div className="mt-3 flex justify-center md:hidden">
            <button
              type="button"
              aria-label={subscribed ? "Se désabonner" : "S'abonner"}
              title={subscribed ? "Se désabonner" : "S'abonner"}
              aria-pressed={subscribed}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full",
                "text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              disabled={subLoading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSubscribe();
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
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{podcast.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
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
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-white">Épisodes</h2>
          <div className="mt-2 flex flex-col items-stretch gap-2 md:mt-0 md:flex-row md:items-center">
            <StatusFilter value={statusFilter} onChange={(v) => onChangeStatusFilter?.(v)} />

            <Button
              type="button"
              variant="outline"
              className="border-white text-white hover:bg-transparent"
              aria-pressed={sortAsc}
              onClick={onToggleSort}
            >
              {sortAsc ? (
                <>
                  Du plus ancien au plus récent
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M12 6l-6 8h12z" />
                  </svg>
                </>
              ) : (
                <>
                  Du plus récent au plus ancien
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M6 10l6 8 6-8z" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
