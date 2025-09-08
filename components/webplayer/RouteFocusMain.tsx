"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteFocusMain() {
  const pathname = usePathname();

  useEffect(() => {
    // Focus the main content container after route change
    const main = document.getElementById("main-content");
    if (!main) return;
    const prevTabIndex = main.getAttribute("tabindex");
    if (prevTabIndex === null) main.setAttribute("tabindex", "-1");
    (main as HTMLElement).focus();
    const onBlur = () => {
      if (prevTabIndex === null) main.removeAttribute("tabindex");
      main.removeEventListener("blur", onBlur);
    };
    main.addEventListener("blur", onBlur);
  }, [pathname]);

  return null;
}
