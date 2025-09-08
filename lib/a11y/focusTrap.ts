import { useEffect } from "react";

export type FocusTrapOptions = {
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  onEscape?: () => void;
  restoreFocus?: boolean;
};

// Selector for focusable elements
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  opts: FocusTrapOptions = {},
) {
  const { initialFocusRef, onEscape, restoreFocus = true } = opts;

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const prevFocused = (typeof document !== "undefined"
      ? (document.activeElement as HTMLElement | null)
      : null);

    // Move focus inside the container
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null || el === container,
    );
    const target = initialFocusRef?.current ?? focusables[0] ?? container;
    // Avoid outline on programmatic focus
    target?.setAttribute("data-skip-outline", "1");
    target?.focus();
    window.setTimeout(() => target?.removeAttribute("data-skip-outline"), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const focusableNow = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === container);
      if (focusableNow.length === 0) {
        e.preventDefault();
        (container as HTMLElement).focus();
        return;
      }
      const first = focusableNow[0];
      const last = focusableNow[focusableNow.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last || !container.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", onKeyDown);

    return () => {
      container.removeEventListener("keydown", onKeyDown);
      if (restoreFocus) prevFocused?.focus?.();
    };
  }, [active, containerRef, initialFocusRef, onEscape, restoreFocus]);
}
