"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function ActiveProfileInitializer() {
  const { hydrateFromServer, active, loading } = useActiveProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrateFromServer();
  }, [hydrateFromServer]);

  useEffect(() => {
    if (!loading && !active) {
      if (pathname !== "/webplayer/profiles") {
        router.replace("/webplayer/profiles");
      }
    }
  }, [active, loading, pathname, router]);

  return null;
}
