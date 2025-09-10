"use client";

import React from "react";
import { useFocusTrap } from "@/lib/a11y/focusTrap";
import { useAudioPlayer } from "@/components/webplayer/AudioPlayerProvider";
import { EpisodeQueueCard } from "@/components/webplayer/EpisodeQueueCard";

export function QueueDrawer({
  open,
  onClose,
  title = "Liste de lecture",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useFocusTrap(containerRef, open, {
    initialFocusRef: closeBtnRef,
    onEscape: onClose,
    restoreFocus: true,
  });

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal={true}
        aria-label={title}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md translate-x-0 transform bg-slate-900 shadow-xl transition-transform duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/10 hover:text-white"
            aria-label="Fermer le panneau de liste de lecture"
            onClick={onClose}
            ref={closeBtnRef}
          >
            ✕
          </button>
        </div>
        <QueueContent />
      </div>
    </>
  );
}

function QueueContent() {
  const { current, queue, setQueue, removeFromQueue, clearQueue, playNow } = useAudioPlayer();
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const moveItem = React.useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
      const next = [...queue];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      setQueue(next);
    },
    [queue, setQueue],
  );

  const onMoveUp = (idx: number) => moveItem(idx, Math.max(0, idx - 1));
  const onMoveDown = (idx: number) => moveItem(idx, Math.min(queue.length - 1, idx + 1));

  return (
    <div className="max-h-[calc(100vh-56px)] overflow-y-auto px-4 py-4">
      {current ? (
        <div className="mb-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-white/60">En cours</div>
          <EpisodeQueueCard
            item={{
              id: current.id,
              name: current.name,
              podcastName: current.podcastName ?? undefined,
              cover: current.cover ?? undefined,
              duration: current.duration ?? null,
              startAt: current.startAt ?? null,
            }}
            isActive
            draggable={false}
            hideControls
          />
        </div>
      ) : null}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-white/80">{queue.length} à venir</div>
        {queue.length > 0 ? (
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-md border border-white/20 px-3 text-xs text-white hover:bg-white/10"
            onClick={() => clearQueue()}
          >
            Vider la liste
          </button>
        ) : null}
      </div>

      {queue.length === 0 ? (
        <p className="text-sm text-white/80">Aucun épisode dans la liste de lecture.</p>
      ) : (
        <div role="list" className="flex flex-col gap-2">
          {queue.map((q, i) => (
            <EpisodeQueueCard
              key={String(q.id)}
              item={{
                id: q.id,
                name: q.name,
                podcastName: q.podcastName,
                cover: q.cover,
                duration: q.duration ?? null,
                startAt: q.startAt ?? null,
              }}
              index={i}
              isActive={false}
              isDropTarget={overIndex === i}
              onPlayNow={() => {
                try {
                  const tail = queue.slice(i + 1).map((e) => ({
                    id: e.id,
                    name: e.name,
                    url: e.url,
                    cover: e.cover,
                    podcastName: e.podcastName,
                    duration: e.duration ?? null,
                  }));
                  const head = queue.slice(0, i).map((e) => ({
                    id: e.id,
                    name: e.name,
                    url: e.url,
                    cover: e.cover,
                    podcastName: e.podcastName,
                    duration: e.duration ?? null,
                  }));
                  const nextQueue = [...tail, ...head];
                  playNow(
                    {
                      id: q.id,
                      name: q.name,
                      url: q.url,
                      cover: q.cover,
                      podcastName: q.podcastName,
                      duration: q.duration ?? null,
                    },
                    nextQueue,
                  );
                } catch {}
              }}
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex != null && dragIndex !== i) moveItem(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onMoveUp={() => onMoveUp(i)}
              onMoveDown={() => onMoveDown(i)}
              onRemove={() => removeFromQueue(q.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
