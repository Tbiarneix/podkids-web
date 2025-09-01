"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PinModal } from "@/components/webplayer/PinModal";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import type { Profile } from "@/types/profile";

export default function ProfilesSelectPage() {
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selecting, setSelecting] = React.useState<Profile | null>(null);
  const [pinOpen, setPinOpen] = React.useState(false);
  const router = useRouter();
  const { setActiveProfile } = useActiveProfile();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profiles");
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data?.profiles)) {
          mounted && setProfiles(data.profiles);
        }
      } finally {
        mounted && setLoading(false);
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
    // Validate against API; throw to show error in PinModal
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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">Choisir un profil</h1>
      {loading ? (
        <p className="text-sm text-muted-foreground text-center">Chargement…</p>
      ) : (
        <div className="min-h-[40vh] w-full flex items-center justify-center">
          <ul className="flex gap-10 justify-center place-items-center">
            {profiles.map((p) => {
              return (
                <li key={p.id} className="flex justify-center">
                  <button
                    className="group flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => onChoose(p)}
                  >
                    <div className="rounded-full border-2 bg-card p-1.5 shadow-sm transition-all group-hover:shadow-md group-hover:border-4">
                      <Image
                        src={`/avatar/avatar-${p.avatar}.webp`}
                        alt={p.name}
                        width={160}
                        height={160}
                        className="rounded-full w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="font-semibold text-2xl text-center">{p.name}</p>
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
        description={selecting ? `Entrez le code PIN parent pour sélectionner « ${selecting.name} ». ` : undefined}
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
