"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Profile } from "@/types/profile";

const LS_KEY = "pk_active_profile";

type ActiveProfilePayload = Pick<Profile, "id" | "name" | "avatar" | "ageRanges"> & {
  updatedAt: number;
  version: 1;
};

function readFromLS(): ActiveProfilePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ActiveProfilePayload;
  } catch {
    return null;
  }
}

function writeToLS(p: ActiveProfilePayload | null) {
  if (typeof window === "undefined") return;
  try {
    if (p) window.localStorage.setItem(LS_KEY, JSON.stringify(p));
    else window.localStorage.removeItem(LS_KEY);
  } catch {}
}

export function useActiveProfile() {
  const [active, setActive] = useState<ActiveProfilePayload | null>(readFromLS());
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef<string | null>(null);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setActive(readFromLS());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Initial fetch to hydrate from server (find active or leave null)
  const hydrateFromServer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "fetch_failed");
      const list: Profile[] = Array.isArray(data?.profiles) ? data.profiles : [];
      const serverActive = list.find((p) => p.activeProfile);
      if (serverActive) {
        const payload: ActiveProfilePayload = {
          id: serverActive.id,
          name: serverActive.name,
          avatar: serverActive.avatar,
          ageRanges: serverActive.ageRanges,
          updatedAt: Date.now(),
          version: 1,
        };
        writeToLS(payload);
        setActive(payload);
      } else {
        // none active on server; keep existing LS (user will choose later)
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // hydrate once on mount
    hydrateFromServer();
  }, [hydrateFromServer]);

  const setActiveProfile = useCallback(async (p: { id: string; name: string; avatar: number; ageRanges: string[] }) => {
    // optimistic update
    const payload: ActiveProfilePayload = { ...p, updatedAt: Date.now(), version: 1 } as any;
    writeToLS(payload);
    setActive(payload);

    // server sync
    pendingRef.current = p.id;
    try {
      const res = await fetch("/api/profiles/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "activate_failed");
      // trust server result
      const prof: Profile | undefined = data?.profile;
      if (prof) {
        const fromServer: ActiveProfilePayload = {
          id: prof.id,
          name: prof.name,
          avatar: prof.avatar,
          ageRanges: prof.ageRanges,
          updatedAt: Date.now(),
          version: 1,
        };
        writeToLS(fromServer);
        setActive(fromServer);
      }
    } catch (e) {
      // revert? keep LS for now; caller may show toast
    } finally {
      pendingRef.current = null;
    }
  }, []);

  const clearActiveProfile = useCallback(() => {
    writeToLS(null);
    setActive(null);
  }, []);

  return useMemo(
    () => ({ active, loading, hydrateFromServer, setActiveProfile, clearActiveProfile }),
    [active, loading, hydrateFromServer, setActiveProfile, clearActiveProfile]
  );
}
