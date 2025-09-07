"use client";

import React from "react";
import Image from "next/image";
import { useAudioPlayer, formatTime } from "@/components/webplayer/AudioPlayerProvider";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const { current, playing, progress, duration, remaining, toggle, seekBy, seekTo } =
    useAudioPlayer();

  if (!current) return null;

  const pct = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
      )}
    >
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          {current.cover ? (
            <Image
              src={current.cover}
              alt={current.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover"
              unoptimized
            />
          ) : (
            <div className="bg-muted h-10 w-10 rounded-md" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">
                {current.name}
                {current.podcastName ? (
                  <span className="text-muted-foreground"> — {current.podcastName}</span>
                ) : null}
              </p>
              <div className="text-muted-foreground shrink-0 text-xs tabular-nums">
                -{formatTime(remaining)}
              </div>
            </div>
            <div className="mt-1">
              <div
                className="group relative h-2 w-full cursor-pointer rounded-full bg-foreground/20"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration || 0)}
                aria-valuenow={Math.floor(progress || 0)}
                aria-label="Position de lecture"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  seekTo((duration || 0) * ratio);
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-yellow-400 transition-[width]"
                  style={{ width: `${pct}%` }}
                />
                {duration > 0 ? (
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 shadow ring-2 ring-background/60 transition-transform group-hover:scale-110"
                    style={{ left: `${pct}%` }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex flex-col items-center">
              <button
                type="button"
                title="Reculer de 10s"
                aria-label="Reculer de 10 secondes"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => seekBy(-10)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M13 19V5l-9 7 9 7Z" />
                  <path d="M22 19V5l-9 7 9 7Z" />
                </svg>
                <span className="sr-only">-10 secondes</span>
              </button>
              <span className="text-muted-foreground mt-0.5 text-xs leading-none">10s</span>
            </div>
            <button
              type="button"
              title={playing ? "Pause" : "Lecture"}
              aria-label={playing ? "Pause" : "Lecture"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-background hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={toggle}
            >
              {playing ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex flex-col items-center">
              <button
                type="button"
                title="Avancer de 10s"
                aria-label="Avancer de 10 secondes"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => seekBy(10)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M11 5v14l9-7-9-7Z" />
                  <path d="M2 5v14l9-7-9-7Z" />
                </svg>
                <span className="sr-only">+10 secondes</span>
              </button>
              <span className="text-muted-foreground mt-0.5 text-xs leading-none">10s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
