import React from "react";
import Image from "next/image";
import { HeaderNav } from "./HeaderNav";
import { AuthButton } from "../auth-button";

export function Header() {
  return (
    <header
      className="z-[100] flex w-full items-center justify-between bg-background px-16 py-6 max-[768px]:gap-4 max-[768px]:px-8 max-[768px]:py-4"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <Image src="/images/Logo.webp" alt="LogoPodkids" width={48} height={48} />
        <p className="text-[1.8rem] font-bold text-primary">Podkids</p>
      </div>
      <div className="hidden items-center gap-5 xl:flex">
        <HeaderNav />
        <AuthButton />
      </div>
      <div className="flex items-center gap-5 xl:hidden">
        <AuthButton />
        <HeaderNav />
      </div>
    </header>
  );
}
