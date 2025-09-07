"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PinModal } from "@/components/webplayer/PinModal";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import type { Profile } from "@/types/profile";

export default function ProfilesSelectPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<Profile | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const router = useRouter();
  const { setActiveProfile } = useActiveProfile();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profiles");
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data?.profiles)) {
          if (mounted) setProfiles(data.profiles);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onChoose(p: Profile) {
    setSelecting(p);
    setPinOpen(true);
  }

  async function handleSubmitPin(pin: string) {
    const res = await fetch("/api/pin/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const code = j?.error;
      const map: Record<string, string> = {
        invalid_pin: "Code PIN incorrect.",
        wrong_pin: "Code PIN incorrect.",
        too_many_attempts: "Trop d'essais, réessayez plus tard.",
        unauthorized: "Vous devez être connecté.",
      };
      throw new Error(map[code] ?? "Erreur lors de la validation.");
    }
    if (!selecting) return;
    await setActiveProfile({
      id: selecting.id,
      name: selecting.name,
      avatar: selecting.avatar,
      ageRanges: selecting.ageRanges as any,
    });
    setSelecting(null);
    router.push("/webplayer");
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-center text-2xl font-semibold">Choisir un profil</h1>
      {loading ? (
        <p className="text-muted-foreground text-center text-sm">Chargement…</p>
      ) : (
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <ul className="flex flex-wrap place-items-center justify-center gap-10">
            {profiles.map((p) => {
              return (
                <li key={p.id} className="flex justify-center">
                  <button
                    className="group flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => onChoose(p)}
                  >
                    <div className="rounded-full border-2 bg-card p-1.5 shadow-sm transition-all group-hover:border-4 group-hover:shadow-md">
                      <Image
                        src={`/avatar/avatar-${p.avatar}.webp`}
                        alt={p.name}
                        width={160}
                        height={160}
                        className="h-28 w-28 rounded-full transition-transform duration-200 ease-out group-hover:scale-[1.03] md:h-32 md:w-32 lg:h-40 lg:w-40"
                      />
                    </div>
                    <p className="text-center text-2xl font-semibold">{p.name}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <PinModal
        open={pinOpen && !!selecting}
        title="Confirmer avec le code PIN"
        description={
          selecting
            ? `Entrez le code PIN parent pour sélectionner « ${selecting.name} ». `
            : undefined
        }
        onClose={() => {
          setPinOpen(false);
          setSelecting(null);
        }}
        onSubmit={handleSubmitPin}
        submitLabel="Valider"
      />
    </div>
  );
}
