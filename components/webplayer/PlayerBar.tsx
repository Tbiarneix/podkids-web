"use client";

import React from "react";
import Image from "next/image";
import { useAudioPlayer, formatTime } from "@/components/webplayer/AudioPlayerProvider";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  List,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";
import { QueueDrawer } from "./QueueDrawer";

export function PlayerBar() {
  const {
    current,
    playing,
    progress,
    duration,
    toggle,
    stop,
    seekBy,
    seekTo,
    volume,
    setVolume,
    toggleMute,
  } = useAudioPlayer();
  const [minimized, setMinimized] = React.useState(false);
  const volDraggingRef = React.useRef(false);
  const volumeTrackRef = React.useRef<HTMLDivElement | null>(null);
  const [queueOpen, setQueueOpen] = React.useState(false);

  const handleVolumeAtClientX = React.useCallback(
    (clientX: number, trackEl: HTMLDivElement | null) => {
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      setVolume(r);
    },
    [setVolume],
  );

  if (!current) return null;

  const pct = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  return (
    <div className={cn("fixed inset-x-0 bottom-3 z-40 px-3 sm:px-4")}>
      <div className={cn("relative", minimized ? "ml-auto w-fit" : "mx-auto max-w-6xl")}>
        {minimized ? (
          <div
            className={cn(
              "relative ml-auto rounded-xl shadow-lg ring-2 ring-yellow-400/60",
              "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",
            )}
          >
            <div className="flex items-center gap-3 px-2 py-1.5 sm:px-3 sm:py-2">
              {current.cover ? (
                <Image
                  src={current.cover}
                  alt={current.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-md object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-muted h-9 w-9 rounded-md" />
              )}
              <button
                type="button"
                title={playing ? "Pause" : "Lecture"}
                aria-label={playing ? "Pause" : "Lecture"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-background hover:bg-yellow-300"
                onClick={toggle}
              >
                {playing ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-background"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-background"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                title="Agrandir le lecteur"
                aria-label="Agrandir le lecteur"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10"
                onClick={() => setMinimized(false)}
              >
                <Maximize2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative overflow-hidden rounded-xl shadow-lg ring-2 ring-yellow-400/60",
              "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",
            )}
          >
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

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-2 max-[520px]:grid-cols-1 max-[520px]:justify-items-center sm:gap-6 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-3 max-[520px]:hidden">
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

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    title="Précédent"
                    aria-label="Piste précédente"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:text-foreground"
                  >
                    <SkipBack className="h-5 w-5" aria-hidden="true" />
                  </button>
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

              <div className="flex shrink-0 items-center gap-2 justify-self-end max-[520px]:hidden sm:gap-3">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10"
                  onClick={() => setQueueOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={queueOpen}
                >
                  <List className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Liste</span>
                </button>
                <div className="group relative max-[520px]:hidden">
                  <button
                    type="button"
                    title={volume === 0 ? "Activer le son" : "Couper le son"}
                    aria-label={volume === 0 ? "Activer le son" : "Couper le son"}
                    onClick={toggleMute}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10"
                  >
                    {volume === 0 ? (
                      <VolumeX className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-5 w-5" aria-hidden="true" />
                    )}
                    <span className="sr-only">Volume</span>
                  </button>
                  <div className="absolute left-1/2 top-full z-10 hidden w-28 -translate-x-1/2 select-none py-1 group-hover:block">
                    <div
                      ref={volumeTrackRef}
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(volume * 100)}
                      aria-label="Volume"
                      className="relative h-2 cursor-pointer rounded bg-foreground/20"
                      onMouseDown={(e) => {
                        volDraggingRef.current = true;
                        handleVolumeAtClientX(e.clientX, volumeTrackRef.current);
                        const move = (ev: MouseEvent) => {
                          if (!volDraggingRef.current) return;
                          handleVolumeAtClientX(ev.clientX, volumeTrackRef.current);
                        };
                        const up = () => {
                          volDraggingRef.current = false;
                          window.removeEventListener("mousemove", move);
                          window.removeEventListener("mouseup", up);
                        };
                        window.addEventListener("mousemove", move);
                        window.addEventListener("mouseup", up);
                      }}
                      onMouseMove={(e) => {
                        if (!volDraggingRef.current) return;
                        handleVolumeAtClientX(e.clientX, volumeTrackRef.current);
                      }}
                      onClick={(e) => {
                        handleVolumeAtClientX(e.clientX, volumeTrackRef.current);
                      }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-yellow-400"
                        style={{ width: `${Math.round(volume * 100)}%` }}
                      />
                      <div
                        className="absolute -top-1.5 -ml-1.5 h-5 w-5 rounded-full border-2 border-yellow-400 bg-background shadow"
                        style={{ left: `${Math.round(volume * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  title="Réduire"
                  aria-label="Réduire le lecteur"
                  onClick={() => setMinimized(true)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10"
                >
                  <Minimize2 className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Réduire</span>
                </button>
                <button
                  type="button"
                  title="Fermer"
                  aria-label="Fermer le lecteur"
                  onClick={stop}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/10"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Fermer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
}
