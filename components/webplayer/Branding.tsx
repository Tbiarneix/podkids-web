"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function Branding() {
  const { active } = useActiveProfile();
  const [mounted, setMounted] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  useEffect(() => setMounted(true), []);

  // Trigger a tiny fade/scale whenever the displayed identity changes
  const isProfile = mounted && !!active;
  useEffect(() => {
    // reset then enable to trigger transition
    setFadeIn(false);
    const id = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(id);
  }, [isProfile, active?.avatar, active?.name]);

  // SSR-safe: fallback is rendered until mounted
  return (
    <div className="flex items-center font-semibold">
      {isProfile ? (
        <div
          className={`flex gap-5 items-center transition-all duration-150 ease-out ${
            fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Image
            src={`/avatar/avatar-${active!.avatar}.webp`}
            alt={active!.name}
            width={48}
            height={48}
            className="rounded-full"
            priority
          />
          <span className="text-[1.8rem] font-bold text-primary">{active!.name}</span>
        </div>
      ) : (
        <div
          className={`flex gap-5 items-center transition-all duration-150 ease-out ${
            fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Image
            src="/images/Logo.webp"
            alt="Podkids"
            width={48}
            height={48}
            priority
          />
          <span className="text-[1.8rem] font-bold text-primary">Podkids</span>
        </div>
      )}
    </div>
  );
}
