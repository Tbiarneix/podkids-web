"use client";

import { useCallback, useState } from "react";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function useSubscription(podcastId: number | string | null | undefined) {
  const { active } = useActiveProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!podcastId) throw new Error("missing_podcast_id");
      if (!active?.id) throw new Error("no_active_profile");

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: active.id, podcastId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "subscribe_failed");
      return true;
    } catch (e: any) {
      setError(e?.message || "subscribe_failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [active?.id, podcastId]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!podcastId) throw new Error("missing_podcast_id");
      if (!active?.id) throw new Error("no_active_profile");

      const res = await fetch("/api/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: active.id, podcastId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "unsubscribe_failed");
      return true;
    } catch (e: any) {
      setError(e?.message || "unsubscribe_failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [active?.id, podcastId]);

  const toggle = useCallback(
    async (next: boolean) => {
      return next ? subscribe() : unsubscribe();
    },
    [subscribe, unsubscribe],
  );

  return { subscribe, unsubscribe, toggle, loading, error };
}
