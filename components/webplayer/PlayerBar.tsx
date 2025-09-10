"use client";

import React from "react";
import Image from "next/image";
import { useAudioPlayer, formatTime } from "@/components/webplayer/AudioPlayerProvider";
import { cn } from "@/lib/utils";
import { RotateCcw, RotateCw, SkipBack, SkipForward, List, Volume2, Minimize2, X } from "lucide-react";

export function PlayerBar() {
  const { current, playing, progress, duration, toggle, stop, seekBy, seekTo } = useAudioPlayer();

  if (!current) return null;

  const pct = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  return (
    <div className={cn("fixed inset-x-0 bottom-3 z-40 px-3 sm:px-4")}>
      <div className="relative mx-auto max-w-6xl">
        {/* Floating card */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl shadow-lg ring-2 ring-yellow-400/60",
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",
          )}
        >
          {/* Top progress bar */}
          <div
            className="group relative h-2 w-full cursor-pointer bg-foreground/20"
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
              className="absolute inset-y-0 left-0 bg-yellow-400 transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-2 sm:gap-6 sm:px-4 sm:py-3">
            {/* Left: cover & titles */}
            <div className="flex min-w-0 items-center gap-3">
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
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{current.name}</p>
                {current.podcastName ? (
                  <p className="text-muted-foreground truncate text-xs">{current.podcastName}</p>
                ) : null}
              </div>
            </div>

            {/* Center: controls */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Prev (playlist) - UI only */}
                <button
                  type="button"
                  title="Précédent"
                  aria-label="Piste précédente"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:text-foreground"
                >
                  <SkipBack className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* -15 with circular arrow and 15 inside */}
                <button
                  type="button"
                  title="Reculer de 15s"
                  aria-label="Reculer de 15 secondes"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-foreground/90"
                  onClick={() => seekBy(-15)}
                >
                  <RotateCcw className="h-6 w-6" aria-hidden="true" />
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-[10px] font-semibold leading-none">
                    15
                  </span>
                  <span className="sr-only">-15 secondes</span>
                </button>

                {/* Play/Pause */}
                <button
                  type="button"
                  title={playing ? "Pause" : "Lecture"}
                  aria-label={playing ? "Pause" : "Lecture"}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-background hover:bg-yellow-300"
                  onClick={toggle}
                >
                  {playing ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-background"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-background"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* +15 with circular arrow and 15 inside */}
                <button
                  type="button"
                  title="Avancer de 15s"
                  aria-label="Avancer de 15 secondes"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-foreground/90"
                  onClick={() => seekBy(15)}
                >
                  <RotateCw className="h-6 w-6" aria-hidden="true" />
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-[10px] font-semibold leading-none">
                    15
                  </span>
                  <span className="sr-only">+15 secondes</span>
                </button>

                {/* Next (playlist) - UI only */}
                <button
                  type="button"
                  title="Suivant"
                  aria-label="Piste suivante"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:text-foreground"
                >
                  <SkipForward className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="text-muted-foreground mt-3 text-xs tabular-nums">
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right: future controls placeholder */}
            <div className="flex shrink-0 items-center gap-2 justify-self-end sm:gap-3">
              {/* Liste */}
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10">
                <List className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Liste</span>
              </button>
              {/* Volume */}
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10">
                <Volume2 className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Volume</span>
              </button>
              {/* Réduire */}
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10">
                <Minimize2 className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Réduire</span>
              </button>
              {/* Fermer */}
              <button type="button" title="Fermer" aria-label="Fermer le lecteur" onClick={stop} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10">
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Fermer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
