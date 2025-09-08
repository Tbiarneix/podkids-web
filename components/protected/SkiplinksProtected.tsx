"use client";

export default function SkiplinksProtected() {
  const handleNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const nav = document.getElementById("protected-action-bar");
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

  return (
    <nav className="relative w-full self-start bg-card" aria-label="Accès rapide">
      <ul className="m-0 flex list-none gap-4 p-0 max-[768px]:flex-col">
        <li>
          <a
            href="#protected-action-bar"
            onClick={handleNavigationClick}
            className="sr-only focus-visible:not-sr-only focus-visible:m-2 focus-visible:px-8 focus-visible:py-4 rounded-lg border border-[var(--pastel-dark)] bg-[var(--pastel-dark)] px-2 py-2 text-base font-bold text-white no-underline transition-all duration-300"
          >
            Aller au menu
          </a>
        </li>
        <li>
          <a
            href="#main-content"
            onClick={handleContentClick}
            className="sr-only focus-visible:not-sr-only focus-visible:m-2 focus-visible:px-8 focus-visible:py-4 rounded-lg border border-[var(--pastel-dark)] bg-[var(--pastel-dark)] px-2 py-2 text-base font-bold text-white no-underline transition-all duration-300"
          >
            Aller au contenu
          </a>
        </li>
      </ul>
    </nav>
  );
}
