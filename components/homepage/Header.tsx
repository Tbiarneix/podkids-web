import React from 'react';
import Image from 'next/image';
import { HeaderNav } from './HeaderNav';
import { AuthButton } from '../auth-button';

export function Header () {
  return (
    <header
      className="bg-background w-full z-[100] flex justify-between items-center py-6 px-16 max-[768px]:py-4 max-[768px]:px-8 max-[768px]:gap-4"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <Image 
          src="/images/Logo.webp" 
          alt="LogoPodkids" 
          width={48} 
          height={48} 
        />
        <p className="text-[1.8rem] font-bold text-primary">Podkids</p>
      </div>
      <div className="flex xl:flex-row-reverse items-center gap-5">
        <AuthButton />
        <HeaderNav />
      </div>
    </header>
  );
};

