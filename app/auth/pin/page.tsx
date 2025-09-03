"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PinModal } from "@/components/webplayer/PinModal";

export default function PinGatePage() {
  return (
    <React.Suspense fallback={null}>
      <PinGateContent />
    </React.Suspense>
  );
}

function PinGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);
  const [checking, setChecking] = useState(true);

  const redirect = searchParams.get("redirect") || "/protected";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/pin", { method: "GET", credentials: "include", cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { exists?: boolean };
        if (mounted && data?.exists === false) {
          setOpen(false);
          router.replace(`/protected/pin?redirect=${encodeURIComponent(redirect)}`);
          return;
        }
      } catch (e: any) {
        try {
          const resp = await fetch("/api/pin", { method: "GET", credentials: "include", cache: "no-store" });
          if (resp.status === 401 && mounted) {
            router.replace("/auth/login");
            return;
          }
        } catch {}
      }
      if (mounted) setChecking(false);
    })();
    return () => {
      mounted = false;
    };
  }, [router, redirect]);

  async function validatePin(pin: string) {
    const res = await fetch("/api/pin/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      let message = "Validation échouée.";
      try {
        const data = await res.json();
        const code = data?.error;
        if (code === "not_set") {
          const target = "/protected/pin?redirect=" + encodeURIComponent(redirect);
          window.location.href = target;
          return;
        }
        const map: Record<string, string> = {
          unauthorized: "Vous devez être connecté.",
          invalid_json: "Requête invalide.",
          invalid_pin: "Entrez 5 chiffres.",
          not_set: "Aucun code PIN défini.",
          wrong_pin: "Code PIN incorrect.",
          too_many_attempts: "Trop d'essais. Réessayez plus tard.",
        };
        message = map[code] ?? message;
      } catch {}
      throw new Error(message);
    }
    window.location.href = redirect;
  }

  if (checking) return null;
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <PinModal
        open={open}
        onClose={() => {
          setOpen(false);
          router.push("/");
        }}
        title="Accès parent"
        description="Entrez votre code PIN pour accéder aux paramètres."
        onSubmit={validatePin}
        submitLabel="Valider"
      />
    </div>
  );
}
