"use client";

export default function Skiplinks() {
  const handleNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth > 1025) {
      e.preventDefault();
      const nav = document.getElementById('main-menu');
      if (nav) {
        const firstFocusable = nav.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable instanceof HTMLElement) {
          firstFocusable.focus();
        }
      }
    }
    if (window.innerWidth <= 1025) {
      e.preventDefault();
      const menuButton = document.querySelector('button[aria-controls="main-menu"]');
      if (menuButton instanceof HTMLElement) {
        menuButton.focus();
      }
    }
  };

  return (
    <nav
      className="relative bg-background sr-only focus-within:not-sr-only focus-within:m-2 focus-within:px-8 focus-within:py-4"
      aria-label="Accès rapide"
    >
      <ul className="flex gap-4 p-0 m-0 list-none max-[768px]:flex-col">
        <li>
          <a
            href="#main-menu"
            onClick={handleNavigationClick}
            className="px-2 py-2 border rounded-lg border-[var(--pastel-dark)] bg-[var(--pastel-dark)] text-white transition-all duration-300 text-base font-bold no-underline"
          >
            Aller au menu de navigation
          </a>
        </li>
        <li>
          <a
            href="#main-content"
            className="px-2 py-2 border rounded-lg border-[var(--pastel-dark)] bg-[var(--pastel-dark)] text-white transition-all duration-300 text-base font-bold no-underline"
          >
            Aller au contenu
          </a>
        </li>
      </ul>
    </nav>
  );
};