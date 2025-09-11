"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAudioPlayer } from "@/components/webplayer/AudioPlayerProvider";
import { dbToAppStatus, sessionStatusesKey } from "@/lib/webplayer/episodeStatus";

export type AppEpisodeStatus = "unlistened" | "listening" | "listened";

type EpisodeLike = { id: number; duration?: number | null };

export function useEpisodeStatus(podcastId?: number | null, episodes: EpisodeLike[] = []) {
  const { current, playing, progress } = useAudioPlayer();

  const [statuses, setStatuses] = useState<
    Record<number, { status: AppEpisodeStatus; progress?: number | null }>
  >({});

  useEffect(() => {
    try {
      if (!podcastId) return;
      const raw = sessionStorage.getItem(sessionStatusesKey(podcastId));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setStatuses(parsed);
    } catch {}
  }, [podcastId]);

  useEffect(() => {
    try {
      if (!podcastId) return;
      sessionStorage.setItem(sessionStatusesKey(podcastId), JSON.stringify(statuses));
    } catch {}
  }, [podcastId, statuses]);

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      if (!podcastId) return;
      try {
        const res = await fetch(`/api/episode-status?podcastId=${podcastId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (aborted) return;
        const map: Record<number, { status: AppEpisodeStatus; progress?: number | null }> = {};
        for (const it of Array.isArray(json.items) ? json.items : []) {
          map[Number(it.episode_id)] = {
            status: dbToAppStatus(it.status),
            progress: typeof it.progress === "number" ? it.progress : Number(it.progress ?? 0),
          };
        }
        setStatuses(map);
      } catch {}
    };
    load();
    return () => {
      aborted = true;
    };
  }, [podcastId]);

  const findDuration = useCallback(
    (episodeId?: number) => {
      if (!episodeId) return 0;
      const match = episodes.find((e) => Number(e.id) === Number(episodeId));
      return Number(match?.duration ?? 0) || 0;
    },
    [episodes],
  );

  const setOptimistic = useCallback(
    (
      episodeId: number,
      updater: (prev: { status: AppEpisodeStatus; progress?: number | null } | undefined) => {
        status: AppEpisodeStatus;
        progress?: number | null;
      },
    ) => {
      setStatuses((m) => ({ ...m, [episodeId]: updater(m[episodeId]) }));
    },
    [],
  );

  const upsert = useCallback(
    async (episodeId: number, status?: AppEpisodeStatus, progressSec?: number) => {
      try {
        const body: any = { episodeId };
        if (status) body.status = status;
        if (typeof progressSec === "number") body.progress = Math.max(0, Math.floor(progressSec));
        await fetch("/api/episode-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        });
      } catch {}
    },
    [],
  );

  const toggleStatus = useCallback(
    async (episodeId: number, next: "unlistened" | "listened") => {
      const prev = statuses[episodeId];
      setOptimistic(episodeId, (p) => ({
        ...(p ?? { progress: 0, status: "unlistened" }),
        status: next,
      }));
      try {
        await upsert(episodeId, next);
      } catch {
        setStatuses((m) => ({ ...m, [episodeId]: prev }));
      }
    },
    [statuses, upsert, setOptimistic],
  );

  // Hybrid progress flush
  const FLUSH_INTERVAL_SECONDS = 30;
  const MIN_PROGRESS_DELTA_SECONDS = 15;
  const END_MARGIN_SECONDS = 2;

  const lastFlushRef = useRef<{ episodeId: number | null; ts: number; progress: number }>({
    episodeId: null,
    ts: 0,
    progress: 0,
  });
  const cooldownRef = useRef<number>(0);

  // Stable refs to avoid resetting timers on frequent progress changes
  const currentIdRef = useRef<number | null>(null);
  const playingRef = useRef<boolean>(false);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    currentIdRef.current = current?.id ? Number(current.id) : null;
  }, [current]);

  useEffect(() => {
    playingRef.current = !!playing;
  }, [playing]);

  useEffect(() => {
    progressRef.current = Number(progress || 0);
  }, [progress]);

  useEffect(() => {
    const id = current?.id ? Number(current.id) : null;
    if (!id) return;
    setOptimistic(id, (p) => ({
      ...(p ?? { progress: 0, status: "unlistened" }),
      status: p?.status === "unlistened" ? "listening" : (p?.status ?? "listening"),
    }));
    void upsert(id, "listening");
  }, [current, setOptimistic, upsert]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const id = currentIdRef.current;
      if (!id || !playingRef.current) return;
      const prog = Number(progressRef.current || 0);
      const last = lastFlushRef.current;
      const now = Date.now();
      const since = (now - last.ts) / 1000;
      const delta = Math.abs(prog - last.progress);
      const durationSec = findDuration(id);

      if (durationSec > 0 && prog >= Math.max(0, durationSec - END_MARGIN_SECONDS)) {
        lastFlushRef.current = { episodeId: id, ts: now, progress: durationSec };
        setOptimistic(id, (p) => ({
          ...(p ?? { progress: 0, status: "unlistened" }),
          status: "listened",
          progress: durationSec,
        }));
        void upsert(id, "listened", durationSec);
        return;
      }

      if (delta >= MIN_PROGRESS_DELTA_SECONDS && now - cooldownRef.current > 5000) {
        cooldownRef.current = now;
        lastFlushRef.current = { episodeId: id, ts: now, progress: prog };
        setOptimistic(id, (p) => ({
          ...(p ?? { progress: 0, status: "unlistened" }),
          status: p?.status === "unlistened" ? "listening" : (p?.status ?? "listening"),
          progress: prog,
        }));
        void upsert(id, undefined, prog);
        return;
      }

      if (since >= FLUSH_INTERVAL_SECONDS) {
        lastFlushRef.current = { episodeId: id, ts: now, progress: prog };
        setOptimistic(id, (p) => ({
          ...(p ?? { progress: 0, status: "unlistened" }),
          progress: prog,
        }));
        void upsert(id, undefined, prog);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [findDuration, setOptimistic, upsert]);

  useEffect(() => {
    const onVisibility = () => {
      if (typeof document === "undefined" || !document.hidden) return;
      const id = currentIdRef.current;
      if (!id) return;
      const prog = Number(progressRef.current || 0);
      try {
        const payload = JSON.stringify({ episodeId: id, progress: Math.max(0, Math.floor(prog)) });
        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/episode-status", blob);
        } else {
          void fetch("/api/episode-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          });
        }
      } catch {}
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const value = useMemo(() => ({ statuses, setStatuses, toggleStatus }), [statuses, toggleStatus]);

  return value;
}
