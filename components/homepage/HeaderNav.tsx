"use client"

import React, { useState, useEffect, useRef } from 'react';

export function HeaderNav () {
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
  <>
    <button 
      ref={burgerButtonRef}
      className={`hidden max-[1280px]:flex flex-col justify-between w-[30px] h-[21px] bg-transparent border-0 p-0 cursor-pointer z-[110]`}
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
        `z-[100] ` +
        `max-[1280px]:fixed max-[1280px]:inset-0 max-[1280px]:left-auto max-[1280px]:w-full max-[1280px]:h-screen max-[1280px]:bg-background max-[1280px]:p-8 max-[1280px]:pt-24 max-[1280px]:shadow-[-5px_0_15px_rgba(0,0,0,0.1)] max-[1280px]:transition-transform max-[1280px]:duration-300 max-[1280px]:transform ` +
        (menuOpen ? 'max-[1280px]:translate-x-0' : 'max-[1280px]:translate-x-full')
      }
      aria-label="Navigation principale" 
      role="navigation"
      id="main-menu"
    >
      <ul className="flex list-none gap-8 max-[1280px]:flex-col max-[1280px]:items-start max-[1280px]:gap-8">
        <li>
          <a
            className="text-foreground font-medium transition-colors duration-300 hover:text-primary max-[1280px]:text-2xl max-[1280px]:block max-[1280px]:py-2"
            href="#features"
            onClick={() => setMenuOpen(false)}
          >
            Fonctionnalités
          </a>
        </li>
        <li>
          <a
            className="text-foreground font-medium transition-colors duration-300 hover:text-primary max-[1280px]:text-2xl max-[1280px]:block max-[1280px]:py-2"
            href="#screenshots"
            onClick={() => setMenuOpen(false)}
          >
            Captures d&apos;écran
          </a>
        </li>
        <li>
          <a
            className="text-foreground font-medium transition-colors duration-300 hover:text-primary max-[1280px]:text-2xl max-[1280px]:block max-[1280px]:py-2"
            href="#download"
            onClick={() => setMenuOpen(false)}
          >
            Télécharger
          </a>
        </li>
      </ul>
    </nav>
  </>
  );
};
