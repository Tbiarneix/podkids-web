"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatusFilterValue = "all" | "unlistened" | "listened";

type StatusFilterProps = {
  value: StatusFilterValue;
  onChange: (v: StatusFilterValue) => void;
  className?: string;
};

export function StatusFilter({ value, onChange, className }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () => [
      { key: "all" as const, label: "Tous les épisodes" },
      { key: "unlistened" as const, label: "Non écoutés" },
      { key: "listened" as const, label: "Déjà écoutés" },
    ],
    [],
  );
  const listRef = useRef<HTMLUListElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const toLabel = (v: StatusFilterValue): string =>
    v === "unlistened" ? "Non écoutés" : v === "listened" ? "Déjà écoutés" : "Tous les épisodes";

  // When opening the listbox, move active/focus to the selected option
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.key === value);
    const nextIdx = idx >= 0 ? idx : 0;
    setActiveIndex(nextIdx);
    const key = options[nextIdx]?.key;
    if (!key) return;
    const id = `status-opt-${key}`;
    requestAnimationFrame(() => {
      optionRefs.current[key]?.focus();
      if (!document.activeElement || (document.activeElement as HTMLElement).id !== id) {
        listRef.current?.focus();
      }
    });
  }, [open, options, value]);

  // Close when clicking outside and restore focus to trigger
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (listRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closeAndFocusTrigger();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className="border-white text-white hover:bg-transparent"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="status-filter-listbox"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
      >
        {toLabel(value)}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M6 10l6 8 6-8z" />
        </svg>
      </Button>

      {open ? (
        <ul
          id="status-filter-listbox"
          role="listbox"
          aria-label="Filtrer les épisodes"
          tabIndex={-1}
          ref={listRef}
          className="absolute left-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-white/20 bg-background/95 p-1 shadow-xl backdrop-blur"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              closeAndFocusTrigger();
              return;
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
              e.preventDefault();
              const max = options.length - 1;
              let next = activeIndex;
              if (e.key === "ArrowDown") next = activeIndex >= max ? 0 : activeIndex + 1;
              if (e.key === "ArrowUp") next = activeIndex <= 0 ? max : activeIndex - 1;
              if (e.key === "Home") next = 0;
              if (e.key === "End") next = max;
              setActiveIndex(next);
              const key = options[next]?.key;
              if (key) optionRefs.current[key]?.focus();
              return;
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const opt = options[activeIndex];
              if (opt) {
                onChange(opt.key);
                closeAndFocusTrigger();
              }
            }
          }}
        >
          {options.map((opt, idx) => (
            <li key={opt.key} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.key}
                id={`status-opt-${opt.key}`}
                tabIndex={activeIndex === idx ? 0 : -1}
                ref={(el) => {
                  optionRefs.current[opt.key] = el;
                }}
                className={cn(
                  "focus-visible-thin flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
                  value === opt.key ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10",
                )}
                onClick={() => {
                  onChange(opt.key);
                  closeAndFocusTrigger();
                }}
              >
                <span>{opt.label}</span>
                {value === opt.key ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
