"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function ActiveProfileInitializer() {
  const { hydrateFromServer, active, loading } = useActiveProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ensure hydration happens when layout mounts
    hydrateFromServer();
  }, [hydrateFromServer]);

  useEffect(() => {
    // After hydration: if no active profile and not already on selection page, redirect
    if (!loading && !active) {
      if (pathname !== "/webplayer/profiles") {
        router.replace("/webplayer/profiles");
      }
    }
  }, [active, loading, pathname, router]);

  return null;
}
