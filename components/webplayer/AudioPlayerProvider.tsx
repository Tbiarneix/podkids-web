"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PlayableEpisode = {
  id: number | string;
  name: string;
  url: string;
  cover?: string | null;
  podcastName?: string | null;
  duration?: number | null;
};

export type AudioPlayerContextType = {
  current: PlayableEpisode | null;
  playing: boolean;
  progress: number; // current time in seconds
  duration: number; // duration in seconds
  remaining: number; // remaining time in seconds
  volume: number; // 0..1
  play: (episode: PlayableEpisode) => void;
  toggle: () => void;
  stop: () => void;
  seekBy: (deltaSeconds: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function useAudioPlayer(): AudioPlayerContextType {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within <AudioPlayerProvider/>");
  return ctx;
}

function formatNumber(n: number) {
  return Math.floor(n).toString().padStart(2, "0");
}

export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${formatNumber(m)}:${formatNumber(s)}`;
  return `${m}:${formatNumber(s)}`;
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayableEpisode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const previousVolumeRef = useRef(1);

  // lazily create the audio element once on client
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "metadata";
      a.volume = volume;
      audioRef.current = a;
    }
    const a = audioRef.current!;
    const onTime = () => setProgress(a.currentTime || 0);
    const onDuration = () => setDuration(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDuration);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDuration);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, [volume]);

  // Apply volume to audio element whenever it changes
  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.volume = Math.max(0, Math.min(1, volume));
      } catch {}
    }
  }, [volume]);

  const play = useCallback((episode: PlayableEpisode) => {
    setCurrent(episode);
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.src !== episode.url) a.src = episode.url;
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    try {
      if (a) {
        a.pause();
        // Clear the source to free memory and ensure ended
        a.removeAttribute("src");
        a.load();
      }
    } catch {}
    setPlaying(false);
    setProgress(0);
    setDuration(0);
    setCurrent(null);
  }, []);

  const seekBy = useCallback((deltaSeconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    try {
      const next = Math.max(
        0,
        Math.min(a.duration || Infinity, (a.currentTime || 0) + deltaSeconds),
      );
      a.currentTime = next;
    } catch {}
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    try {
      const next = Math.max(0, Math.min(a.duration || Infinity, seconds));
      a.currentTime = next;
    } catch {}
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(() => {
      // remember previous non-zero volume for mute toggle
      if (clamped > 0) previousVolumeRef.current = clamped;
      return clamped;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setVolumeState((v) => {
      if (v > 0) {
        previousVolumeRef.current = v;
        return 0;
      }
      return previousVolumeRef.current || 1;
    });
  }, []);

  const value = useMemo<AudioPlayerContextType>(
    () => ({
      current,
      playing,
      progress,
      duration,
      remaining: Math.max(0, (duration || 0) - (progress || 0)),
      volume,
      play,
      toggle,
      stop,
      seekBy,
      seekTo,
      setVolume,
      toggleMute,
    }),
    [current, playing, progress, duration, volume, play, toggle, stop, seekBy, seekTo, setVolume, toggleMute],
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}
