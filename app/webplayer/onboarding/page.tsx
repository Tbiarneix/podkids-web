"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgeRange } from "@/types/podcast";
import { ageRangeToLabel } from "@/utils/ageRange";
import type { ProfileFormData } from "@/types/profile";
import { useActiveProfile } from "@/hooks/useActiveProfile";

const ORDERED_AGE_RANGES: AgeRange[] = [
  AgeRange.UNDER_3,
  AgeRange.BETWEEN_4_AND_6,
  AgeRange.BETWEEN_7_AND_9,
  AgeRange.BETWEEN_10_AND_12,
  AgeRange.BETWEEN_13_AND_15,
  AgeRange.OVER_15,
];

export default function WebplayerOnboardingPage() {
  const router = useRouter();
  const { setActiveProfile } = useActiveProfile();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<number | null>(null);
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && avatar !== null && ageRanges.length > 0,
    [name, avatar, ageRanges]
  );

  function toggleAgeRange(ar: AgeRange) {
    setAgeRanges((prev) => (prev.includes(ar) ? prev.filter((x) => x !== ar) : [...prev, ar]));
  }

  // If profiles already exist, do not show onboarding
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/profiles", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/auth/login?redirect=" + encodeURIComponent("/webplayer/onboarding"));
          return;
        }
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.profiles) ? data.profiles : [];
        if (!mounted) return;
        if (list.length > 0) {
          router.replace("/webplayer");
          return;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const payload: ProfileFormData = {
      name: name.trim(),
      avatar: avatar as number,
      ageRanges,
    };
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error ? String(data.error) : "Erreur lors de la création du profil";
        throw new Error(msg);
      }
      const p = data?.profile;
      if (p?.id) {
        await setActiveProfile({ id: p.id, name: p.name, avatar: p.avatar, ageRanges: p.ageRanges });
      }
      toast.success("Profil créé");
      router.replace("/webplayer");
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la création du profil");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Bienvenue sur le webplayer</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Créez un premier profil pour personnaliser l&apos;expérience d&apos;écoute.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">Nom</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'enfant"
            autoFocus
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm">Choisir un avatar</p>
          <div className="flex items-center justify-start gap-3 flex-wrap">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((id) => {
              const selected = avatar === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatar(id)}
                  className={
                    "rounded-full p-1 transition-colors focus:outline-none focus:ring-2 " +
                    (selected
                      ? "ring-primary border-2 border-primary bg-primary/10"
                      : "border border-muted/40 hover:border-primary/50 bg-muted/10 hover:bg-muted/20 focus:ring-primary/40")
                  }
                  aria-pressed={selected}
                  aria-label={`Avatar ${id}`}
                >
                  <Image
                    src={`/avatar/avatar-${id}.webp`}
                    alt={`Avatar ${id}`}
                    width={75}
                    height={75}
                    className="rounded-full"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm">Tranche d&apos;âge</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ORDERED_AGE_RANGES.map((ar) => {
              const selected = ageRanges.includes(ar);
              return (
                <button
                  key={ar}
                  type="button"
                  onClick={() => toggleAgeRange(ar)}
                  className={
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors " +
                    (selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/20 text-foreground border border-muted/40 hover:bg-muted/30")
                  }
                  aria-pressed={selected}
                >
                  {ageRangeToLabel(ar)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => router.replace("/webplayer")} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={!canSubmit || submitting}>
            {submitting ? "Enregistrement..." : "Créer le profil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
