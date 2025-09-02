"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PinModal } from "@/components/webplayer/PinModal";
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
  const [confirmSwitchOpen, setConfirmSwitchOpen] = React.useState(false);
  const openBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);
  const confirmCancelRef = React.useRef<HTMLButtonElement | null>(null);
  const confirmGoRef = React.useRef<HTMLButtonElement | null>(null);

  const canShowChangeProfile = (profilesCount ?? 0) > 1;

  React.useEffect(() => {
    if (!pinOpen) {
      prevFocusRef.current?.focus?.();
    } else {
      prevFocusRef.current = (typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
    }
  }, [pinOpen]);

  React.useEffect(() => {
    if (confirmSwitchOpen) {
      prevFocusRef.current = (typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
      const t = window.setTimeout(() => {
        confirmCancelRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    } else {
      prevFocusRef.current?.focus?.();
    }
  }, [confirmSwitchOpen]);


  async function handleSubmitPin(pin: string) {
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
        too_many_attempts: "Trop d'essais, réessayez plus tard.",
        not_set: "Aucun code PIN configuré.",
      };
      throw new Error(map[code] ?? "Erreur lors de la validation.");
    }
    router.push("/protected");
  }

  return (
    <div className="flex items-center gap-3">
      {canShowChangeProfile ? (
        <Button
          variant="outline"
          className="bg-card rounded-full inline-flex items-center gap-2"
          onClick={() => {
            setConfirmSwitchOpen(true);
          }}
        >
          <Users className="size-4" aria-hidden />
          <span>Changer de profil</span>
        </Button>
      ) : null}

      <Button
        variant="outline"
        className="bg-card rounded-full inline-flex items-center gap-2"
        ref={openBtnRef}
        onClick={() => setPinOpen(true)}
      >
        <KeyRound className="size-4" aria-hidden />
        <span>Accès parent</span>
      </Button>

      <PinModal
        open={pinOpen}
        title="Accès parent"
        description="Saisissez votre code PIN pour accéder aux paramètres."
        onClose={() => setPinOpen(false)}
        onSubmit={handleSubmitPin}
        submitLabel="Valider"
      />

      {confirmSwitchOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-switch-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirmSwitchOpen(false);
            if (e.key === "Tab") {
              const first = confirmCancelRef.current;
              const last = confirmGoRef.current;
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
            onClick={() => setConfirmSwitchOpen(false)}
          />
          <div className="relative z-10 w-[90%] max-w-sm rounded-2xl border bg-card p-5 text-card-foreground shadow-xl">
            <h2 id="confirm-switch-title" className="text-lg font-semibold mb-1">
              Changer de profil ?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Attention, si tu quittes ton profil, tu devras demander à un parent de te reconnecter.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" ref={confirmCancelRef} onClick={() => setConfirmSwitchOpen(false)}>
                Annuler
              </Button>
              <Button
                type="button"
                ref={confirmGoRef}
                onClick={() => {
                  setConfirmSwitchOpen(false);
                  router.push("/webplayer/profiles");
                }}
              >
                Continuer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
