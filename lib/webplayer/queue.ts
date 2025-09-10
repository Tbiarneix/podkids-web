import { useCallback, useState } from "react";

export type QueueItem = {
  id: number | string;
  name: string;
  url: string;
  cover?: string | null;
  podcastName?: string | null;
  duration?: number | null;
  startAt?: number | null;
};

export type UsePlaybackQueue = {
  queue: QueueItem[];
  setQueue: (items: QueueItem[]) => void;
  enqueue: (items: QueueItem[] | QueueItem) => void;
  enqueueNext: (items: QueueItem[] | QueueItem) => void;
  removeFromQueue: (id: QueueItem["id"]) => void;
  clearQueue: () => void;
  next: (play: (item: QueueItem) => void) => void;
  playNow: (
    item: QueueItem,
    nextQueue: QueueItem[] | undefined,
    play: (item: QueueItem) => void,
  ) => void;
};

export function usePlaybackQueue(): UsePlaybackQueue {
  const [queue, setQueueState] = useState<QueueItem[]>([]);

  const setQueue = useCallback((items: QueueItem[]) => {
    setQueueState(items);
  }, []);

  const enqueue = useCallback((items: QueueItem[] | QueueItem) => {
    const toAdd = Array.isArray(items) ? items : [items];
    setQueueState((prev) => [...prev, ...toAdd]);
  }, []);

  const enqueueNext = useCallback((items: QueueItem[] | QueueItem) => {
    const toAdd = Array.isArray(items) ? items : [items];
    setQueueState((prev) => [...toAdd, ...prev]);
  }, []);

  const removeFromQueue = useCallback((id: QueueItem["id"]) => {
    setQueueState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearQueue = useCallback(() => setQueueState([]), []);

  const next = useCallback((play: (item: QueueItem) => void) => {
    setQueueState((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      play(first);
      return rest;
    });
  }, []);

  const playNow = useCallback(
    (item: QueueItem, nextQueue: QueueItem[] | undefined, play: (item: QueueItem) => void) => {
      if (Array.isArray(nextQueue)) setQueueState(nextQueue);
      play(item);
    },
    [],
  );

  return {
    queue,
    setQueue,
    enqueue,
    enqueueNext,
    removeFromQueue,
    clearQueue,
    next,
    playNow,
  };
}
