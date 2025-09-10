"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function Branding() {
  const { active } = useActiveProfile();
  const [mounted, setMounted] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  useEffect(() => setMounted(true), []);

  const isProfile = mounted && !!active;
  useEffect(() => {
    setFadeIn(false);
    const id = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(id);
  }, [isProfile, active?.avatar, active?.name]);

  return (
    <div className="flex items-center font-semibold">
      {isProfile ? (
        <div
          className={`flex items-center gap-5 transition-all duration-150 ease-out ${
            fadeIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <Image
            src={`/avatar/avatar-${active!.avatar}.webp`}
            alt=""
            role="presentation"
            width={48}
            height={48}
            className="rounded-full"
            priority
          />
          <span className="text-[1.8rem] font-bold text-primary">
            <span className="sr-only">Profil de </span>
            {active!.name}
          </span>
        </div>
      ) : (
        <div
          className={`flex items-center gap-5 transition-all duration-150 ease-out ${
            fadeIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <Image src="/images/Logo.webp" alt="Podkids Logo" width={48} height={48} priority />
          <span className="text-[1.8rem] font-bold text-primary">Podkids</span>
        </div>
      )}
    </div>
  );
}
