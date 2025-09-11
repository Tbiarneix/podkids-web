"use client";

import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-card p-8">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 max-[520px]:flex-col max-[520px]:gap-4">
        <div className="flex items-center gap-2">
          <Image src="/images/Logo.webp" alt="Podkids Logo" width={40} height={40} />
          <span className="text-[1.5rem] font-bold text-primary">Podkids</span>
        </div>
        <p className="text-foreground">
          &copy; {new Date().getFullYear()} Podkids. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
