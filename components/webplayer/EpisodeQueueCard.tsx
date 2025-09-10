"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatTime } from "@/components/webplayer/AudioPlayerProvider";
import { ArrowDown, ArrowUp, GripVertical, Trash2, Play } from "lucide-react";

export type EpisodeQueueItem = {
  id: number | string;
  name: string;
  podcastName?: string | null;
  cover?: string | null;
  duration?: number | null;
};

export type EpisodeQueueCardProps = {
  item: EpisodeQueueItem;
  index?: number;
  isActive?: boolean;
  draggable?: boolean;
  hideControls?: boolean;
  isDropTarget?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, item: EpisodeQueueItem) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, item: EpisodeQueueItem) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, item: EpisodeQueueItem) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>, item: EpisodeQueueItem) => void;
  onMoveUp?: (item: EpisodeQueueItem) => void;
  onMoveDown?: (item: EpisodeQueueItem) => void;
  onRemove?: (item: EpisodeQueueItem) => void;
  onPlayNow?: (item: EpisodeQueueItem) => void;
  className?: string;
};

export function EpisodeQueueCard({
  item,
  isActive = false,
  draggable = true,
  hideControls = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onRemove,
  onPlayNow,
  className,
}: EpisodeQueueCardProps) {
  const titleId = React.useId();
  const subtitleId = React.useId();

  return (
    <div
      role="listitem"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      className={cn(
        "group relative flex items-center gap-2 rounded-xl border bg-card/95 p-2 text-card-foreground shadow-sm",
        isActive ? "ring-2 ring-yellow-400/70" : "border-border",
        isDropTarget && !isActive ? "ring-2 ring-yellow-300/60" : null,
        className,
      )}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, item)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, item);
      }}
      onDrop={(e) => onDrop?.(e, item)}
      onDragEnd={(e) => onDragEnd?.(e, item)}
    >
      {!hideControls && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Réorganiser"
            title="Réorganiser"
            className="focus-visible-thin inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 hover:bg-foreground/10"
            tabIndex={-1}
            aria-hidden="true"
          >
            <GripVertical className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex flex-col">
            <button
              type="button"
              aria-label="Monter"
              title="Monter"
              className="focus-visible-thin inline-flex h-6 w-8 items-center justify-center rounded-md text-foreground/80 hover:bg-foreground/10"
              onClick={() => onMoveUp?.(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onMoveUp?.(item);
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  onMoveUp?.(item);
                }
              }}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Descendre"
              title="Descendre"
              className="focus-visible-thin inline-flex h-6 w-8 items-center justify-center rounded-md text-foreground/80 hover:bg-foreground/10"
              onClick={() => onMoveDown?.(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onMoveDown?.(item);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  onMoveDown?.(item);
                }
              }}
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {item.cover ? (
        <Image
          src={item.cover}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
          unoptimized
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-lg bg-foreground/10" />
      )}
      <div className="min-w-0 flex-1">
        <div
          id={titleId}
          className={cn("truncate text-sm font-medium", isActive && "text-yellow-400")}
        >
          {item.name}
        </div>
        <div id={subtitleId} className="truncate text-xs text-foreground/60">
          {item.podcastName ?? "Podcast"}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="text-xs tabular-nums text-foreground/70">
          {formatTime(Math.max(0, Math.floor(Number(item.duration ?? 0))))}
        </div>
        {!hideControls && (
          <button
            type="button"
            aria-label="Lire maintenant"
            title="Lire maintenant"
            className="focus-visible-thin inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 hover:bg-foreground/10"
            onClick={() => onPlayNow?.(item)}
          >
            <Play className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {!hideControls && (
          <button
            type="button"
            aria-label="Retirer de la liste"
            title="Retirer de la liste"
            className="focus-visible-thin inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 hover:bg-foreground/10"
            onClick={() => onRemove?.(item)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
