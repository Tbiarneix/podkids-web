"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PinModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void> | void;
  submitLabel?: string;
}

export function PinModal({ open, title = "Accès parent", description = "Saisissez votre code PIN.", onClose, onSubmit, submitLabel = "Valider" }: PinModalProps) {
  const [pinDigits, setPinDigits] = React.useState<string[]>(Array.from({ length: 5 }, () => ""));
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [blockedUntil, setBlockedUntil] = React.useState<number | null>(null);
  const [remaining, setRemaining] = React.useState<number>(0);

  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const cancelBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const submitBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);

  const MAX_ATTEMPTS = 3;
  const BLOCK_MS = 60_000; // 1 minute
  const LS_KEY = "pk_pin_block";

  function readBlockState() {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as { until: number; attempts: number };
    } catch {}
    return null;
  }

  function writeBlockState(until: number | null, nextAttempts: number) {
    try {
      if (typeof window === "undefined") return;
      if (until) window.localStorage.setItem(LS_KEY, JSON.stringify({ until, attempts: nextAttempts }));
      else window.localStorage.removeItem(LS_KEY);
    } catch {}
  }

  React.useEffect(() => {
    if (open) {
      prevFocusRef.current = (typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
      const t = window.setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    } else {
      prevFocusRef.current?.focus?.();
    }
  }, [open]);

  // Initialize attempts and blocked state when opening
  React.useEffect(() => {
    if (!open) return;
    const st = readBlockState();
    if (st?.until && st.until > Date.now()) {
      setBlockedUntil(st.until);
      setAttempts(Math.min(st.attempts ?? 0, MAX_ATTEMPTS));
    } else {
      setBlockedUntil(null);
      setAttempts(st?.attempts ?? 0);
      // clear expired state
      if (st?.until) writeBlockState(null, 0);
    }
  }, [open]);

  // Countdown for remaining time while blocked
  React.useEffect(() => {
    if (!blockedUntil) {
      setRemaining(0);
      return;
    }
    const update = () => {
      const diff = Math.max(0, blockedUntil - Date.now());
      setRemaining(Math.ceil(diff / 1000));
      if (diff <= 0) {
        setBlockedUntil(null);
        setAttempts(0);
        writeBlockState(null, 0);
      }
    };
    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [blockedUntil]);

  function handleChange(index: number, value: string) {
    const v = value.replace(/\D/g, "");
    if (v.length === 0) return;
    const next = [...pinDigits];
    next[index] = v[v.length - 1];
    setPinDigits(next);
    setError(null);
    if (index < 4) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...pinDigits];
      if (next[index]) {
        next[index] = "";
        setPinDigits(next);
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const prev = [...pinDigits];
        prev[index - 1] = "";
        setPinDigits(prev);
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!text) return;
    e.preventDefault();
    const arr = Array.from({ length: 5 }, (_, i) => text[i] ?? "");
    setPinDigits(arr);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const pin = pinDigits.join("");
    if (!/^\d{5}$/.test(pin)) {
      setError("Entrez 5 chiffres.");
      return;
    }
    // Check local block
    if (blockedUntil && blockedUntil > Date.now()) {
      setError("Trop d'essais, réessayez dans " + remaining + "s.");
      return;
    }
    try {
      setLoading(true);
      await onSubmit(pin);
      setPinDigits(Array.from({ length: 5 }, () => ""));
      onClose();
    } catch (err: any) {
      const message = typeof err === "string" ? err : err?.message;
      setError(message || "Erreur lors de la validation.");
      // Track attempts and possibly block
      const next = attempts + 1;
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + BLOCK_MS;
        setBlockedUntil(until);
        setAttempts(0);
        writeBlockState(until, 0);
      } else {
        setAttempts(next);
        writeBlockState(null, next);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const sequence = [
            ...inputsRef.current.filter(Boolean),
            cancelBtnRef.current,
            submitBtnRef.current,
          ].filter(Boolean) as HTMLElement[];
          if (sequence.length === 0) return;
          const first = sequence[0];
          const last = sequence[sequence.length - 1];
          const active = document.activeElement as HTMLElement | null;
          if (e.shiftKey) {
            if (active === first) {
              e.preventDefault();
              last?.focus();
            }
          } else {
            if (active === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }
      }}
    >
      <button aria-label="Fermer" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form className="relative z-10 w-[90%] max-w-sm rounded-2xl border bg-card p-5 text-card-foreground shadow-xl" onSubmit={handleSubmit}>
        <h2 id="pin-title" className="text-lg font-semibold mb-1">
          {title}
        </h2>
        {description ? <p className="text-sm text-muted-foreground mb-4">{description}</p> : null}
        <div className="flex items-center justify-center gap-3">
          {pinDigits.map((val, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Chiffre ${i + 1}`}
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              disabled={!!blockedUntil}
              className="h-14 w-12 md:h-16 md:w-14 text-center text-xl md:text-2xl font-semibold rounded-md bg-background text-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            />
          ))}
        </div>
        {blockedUntil ? (
          <p className="mt-3 text-sm text-red-500">Trop d'essais, réessayez dans {remaining}s.</p>
        ) : error ? (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" ref={cancelBtnRef} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading || !!blockedUntil} ref={submitBtnRef}>
            {loading ? "Validation…" : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
