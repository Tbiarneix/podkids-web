"use client";

import React from "react";

export default function SkiplinksInApp() {
  const [playerActive, setPlayerActive] = React.useState(false);

  React.useEffect(() => {
    const selectors = [
      'button[aria-label="Pause"]',
      'button[aria-label="Lecture"]',
      '[role="slider"][aria-label="Position de lecture"]',
    ];
    const check = () => {
      const el = document.querySelector(selectors.join(", "));
      setPlayerActive(!!el);
    };
    check();
    const observer = new MutationObserver(() => check());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  const handleNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const nav = document.getElementById("action-bar");
    if (nav) {
      const firstFocusable = nav.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    if (main) {
      const prevTabIndex = main.getAttribute("tabindex");
      if (prevTabIndex === null) main.setAttribute("tabindex", "-1");
      (main as HTMLElement).focus();
      const onBlur = () => {
        if (prevTabIndex === null) main.removeAttribute("tabindex");
        main.removeEventListener("blur", onBlur);
      };
      main.addEventListener("blur", onBlur);
    }
  };

  const handlePlayerClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Prefer focusing the Play/Pause button, fallback to the progress slider
    const playBtn =
      (document.querySelector('button[aria-label="Pause"]') as HTMLElement | null) ||
      (document.querySelector('button[aria-label="Lecture"]') as HTMLElement | null);
    const target =
      playBtn ||
      (document.querySelector('[role="slider"][aria-label="Position de lecture"]') as
        | HTMLElement
        | null);
    if (target) {
      const prevTabIndex = target.getAttribute("tabindex");
      if (prevTabIndex === null) target.setAttribute("tabindex", "0");
      target.focus();
      const onBlur = () => {
        if (prevTabIndex === null) target.removeAttribute("tabindex");
        target.removeEventListener("blur", onBlur);
      };
      target.addEventListener("blur", onBlur);
    }
  };

  return (
    <nav
      className="sr-only relative w-full self-start bg-card focus-within:not-sr-only focus-within:m-2 focus-within:px-8 focus-within:py-4"
      aria-label="Accès rapide"
    >
      <ul className="m-0 flex list-none gap-4 p-0 max-[768px]:flex-col">
        <li>
          <a
            href="#action-bar"
            onClick={handleNavigationClick}
            className="rounded-lg border border-[var(--pastel-dark)] bg-[var(--pastel-dark)] px-2 py-2 text-base font-bold text-white no-underline transition-all duration-300"
          >
            Aller au menu
          </a>
        </li>
        <li>
          <a
            href="#main-content"
            onClick={handleContentClick}
            className="rounded-lg border border-[var(--pastel-dark)] bg-[var(--pastel-dark)] px-2 py-2 text-base font-bold text-white no-underline transition-all duration-300"
          >
            Aller au contenu
          </a>
        </li>
        {playerActive ? (
          <li>
            <a
              href="#audio-player"
              onClick={handlePlayerClick}
              className="rounded-lg border border-[var(--pastel-dark)] bg-[var(--pastel-dark)] px-2 py-2 text-base font-bold text-white no-underline transition-all duration-300"
            >
              Aller au lecteur audio
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
