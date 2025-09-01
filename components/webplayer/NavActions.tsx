"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users, KeyRound } from "lucide-react";

function useProfilesCount() {
  const [count, setCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    let mounted = true;
    fetch("/api/profiles")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!mounted) return;
        const c = Array.isArray(j?.profiles) ? j.profiles.length : 0;
        setCount(c);
      })
      .catch(() => setCount(0));
    return () => {
      mounted = false;
    };
  }, []);
  return count;
}

export function NavActions() {
  const router = useRouter();
  const profilesCount = useProfilesCount();
  const [pinOpen, setPinOpen] = React.useState(false);
  const [pinDigits, setPinDigits] = React.useState<string[]>(Array.from({ length: 5 }, () => ""));
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const openBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const submitBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);

  const canShowChangeProfile = (profilesCount ?? 0) > 1;

  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (pinOpen) {
      prevFocusRef.current = (typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
      const t = window.setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    } else {
      prevFocusRef.current?.focus?.();
    }
  }, [pinOpen]);

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

  async function validatePin(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const pin = pinDigits.join("");
    if (!/^\d{5}$/.test(pin)) {
      setError("Entrez 5 chiffres.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/pin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        const code = j?.error || `HTTP_${res.status}`;
        const map: Record<string, string> = {
          unauthorized: "Vous devez être connecté.",
          invalid_json: "Requête invalide.",
          invalid_pin: "Code PIN invalide.",
          wrong_pin: "Code PIN incorrect.",
          not_set: "Aucun code PIN configuré.",
        };
        setError(map[code] ?? "Erreur lors de la validation.");
        return;
      }
      // success
      setPinDigits(Array.from({ length: 5 }, () => ""));
      setPinOpen(false);
      router.push("/protected");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {canShowChangeProfile ? (
        <Button
          variant="outline"
          className="rounded-full inline-flex items-center gap-2"
          onClick={() => {
            // Placeholder: open a basic modal later to choose profile
            // For now, navigate to manage profiles page
            router.push("/protected/profiles");
          }}
        >
          <Users className="size-4" aria-hidden />
          <span>Changer de profil</span>
        </Button>
      ) : null}

      <Button
        variant="outline"
        className="rounded-full inline-flex items-center gap-2"
        ref={openBtnRef}
        onClick={() => setPinOpen(true)}
      >
        <KeyRound className="size-4" aria-hidden />
        <span>Accès parent</span>
      </Button>

      {pinOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setPinOpen(false);
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
          <button
            aria-label="Fermer"
            className="absolute inset-0 bg-black/50"
            onClick={() => setPinOpen(false)}
          />
          <form
            className="relative z-10 w-[90%] max-w-sm rounded-2xl border bg-card p-5 text-card-foreground shadow-xl"
            onSubmit={validatePin}
          >
            <h2 id="pin-title" className="text-lg font-semibold mb-1">
              Accès parent
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Saisissez votre code PIN pour accéder aux paramètres.</p>
            <div className="flex items-center justify-center gap-3">
              {pinDigits.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label={`Chiffre ${i + 1}`}
                  pattern="[0-9]*"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  className="h-14 w-12 md:h-16 md:w-14 text-center text-xl md:text-2xl font-semibold rounded-md bg-background text-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              ))}
            </div>
            {error ? (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" ref={cancelBtnRef} onClick={() => setPinOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} ref={submitBtnRef}>
                {loading ? "Validation…" : "Valider"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
