"use client";

import React from "react";
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
  const [open, setOpen] = React.useState(true);

  const redirect = searchParams.get("redirect") || "/protected";

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
