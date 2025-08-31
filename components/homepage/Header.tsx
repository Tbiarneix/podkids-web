"use client"

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export function Header () {
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Accessibilité
  // Gestion du trapfocus
  useEffect(() => {
    if (!menuOpen || !navRef.current) return;

    const focusableElements = navRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableElementRef.current = burgerButtonRef.current as HTMLElement;
    lastFocusableElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstFocusableElementRef.current?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstFocusableElementRef.current) {
        e.preventDefault();
        lastFocusableElementRef.current?.focus();
      }
      
      if (!e.shiftKey && document.activeElement === lastFocusableElementRef.current) {
        e.preventDefault();
        firstFocusableElementRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [menuOpen]);

  // Gestionnaire pour fermer le menu avec la touche Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        burgerButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
      
      <button 
        ref={burgerButtonRef}
        className={`hidden max-[520px]:flex flex-col justify-between w-[30px] h-[21px] bg-transparent border-0 p-0 cursor-pointer z-[110]`}
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-controls="main-menu"
      >
        <span
          className={`w-full h-[3px] bg-primary rounded-[10px] transition-all duration-300 ${menuOpen ? 'translate-y-[9px] rotate-45' : ''}`}
        />
        <span
          className={`w-full h-[3px] bg-primary rounded-[10px] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
        />
        <span
          className={`w-full h-[3px] bg-primary rounded-[10px] transition-all duration-300 ${menuOpen ? '-translate-y-[9px] -rotate-45' : ''}`}
        />
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[90]" onClick={() => setMenuOpen(false)}></div>
      )}

      <nav 
        ref={navRef}
        className={
          `max-[520px]:fixed max-[520px]:top-0 max-[520px]:right-[-100%] max-[520px]:w-full max-[520px]:h-screen max-[520px]:bg-background max-[520px]:p-8 max-[520px]:pt-24 max-[520px]:shadow-[-5px_0_15px_rgba(0,0,0,0.1)] max-[520px]:transition-[right] max-[520px]:duration-300 z-[100] ` +
          (menuOpen ? 'max-[520px]:right-0' : '')
        }
        aria-label="Navigation principale" 
        role="navigation"
        id="main-menu"
      >
        <ul className="flex list-none gap-8 max-[520px]:flex-col max-[520px]:items-start max-[520px]:gap-6">
          <li>
            <a
              className="text-foreground font-medium transition-colors duration-300 hover:text-primary"
              href="#features"
              onClick={() => setMenuOpen(false)}
            >
              Fonctionnalités
            </a>
          </li>
          <li>
            <a
              className="text-foreground font-medium transition-colors duration-300 hover:text-primary"
              href="#screenshots"
              onClick={() => setMenuOpen(false)}
            >
              Captures d'écran
            </a>
          </li>
          <li>
            <a
              className="text-foreground font-medium transition-colors duration-300 hover:text-primary"
              href="#download"
              onClick={() => setMenuOpen(false)}
            >
              Télécharger / Se connecter
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

