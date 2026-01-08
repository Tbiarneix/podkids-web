"use client";

import Image from "next/image";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function Branding() {
  const { active } = useActiveProfile();
  const isProfile = !!active;
  // Use a key to retrigger CSS-based enter animations when profile info changes
  const animKey = isProfile ? `${active!.avatar}-${active!.name}` : "logo";

  return (
    <div className="flex items-center font-semibold">
      {isProfile ? (
        <div
          key={animKey}
          className={
            "flex items-center gap-5 duration-150 ease-out animate-in fade-in-0 zoom-in-95"
          }
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
          key={animKey}
          className={
            "flex items-center gap-5 duration-150 ease-out animate-in fade-in-0 zoom-in-95"
          }
        >
          <Image src="/images/Logo.webp" alt="Podkids Logo" width={48} height={48} priority />
          <span className="text-[1.8rem] font-bold text-primary">Podkids</span>
        </div>
      )}
    </div>
  );
}
