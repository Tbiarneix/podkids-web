"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import { AgeRange } from "@/types/podcast";
import { ageRangeToLabel } from "@/utils/ageRange";
import type { ProfileFormData } from "@/types/profile";

const ORDERED_AGE_RANGES: AgeRange[] = [
  AgeRange.UNDER_3,
  AgeRange.BETWEEN_4_AND_6,
  AgeRange.BETWEEN_7_AND_9,
  AgeRange.BETWEEN_10_AND_12,
  AgeRange.BETWEEN_13_AND_15,
  AgeRange.OVER_15,
];

export default function ProfilesManager() {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<number | null>(null);
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const canSubmit = useMemo(() => name.trim().length > 0 && avatar !== null && ageRanges.length > 0, [name, avatar, ageRanges]);

  function resetForm() {
    setName("");
    setAvatar(null);
    setAgeRanges([]);
  }

  function toggleAgeRange(ar: AgeRange) {
    setAgeRanges((prev) => (prev.includes(ar) ? prev.filter((x) => x !== ar) : [...prev, ar]));
  }

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const payload: ProfileFormData = {
      name: name.trim(),
      avatar: avatar as number,
      ageRanges,
    };
    try {
      const url = editingId ? `/api/profiles/${editingId}` : "/api/profiles";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "request_failed");
      }
      toast.success(editingId ? "Profil mis à jour" : "Profil enregistré");
      setOpen(false);
      setEditingId(null);
      await fetchProfiles();
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Erreur lors de l'enregistrement";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchProfiles() {
    const res = await fetch("/api/profiles");
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setProfiles(Array.isArray(data?.profiles) ? data.profiles : []);
    }
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  function openCreate() {
    setEditingId(null);
    resetForm();
    setOpen(true);
  }

  function openEdit(p: any) {
    setEditingId(p.id);
    setName(p.name ?? "");
    setAvatar(p.avatar ?? null);
    setAgeRanges(Array.isArray(p.ageRanges) ? p.ageRanges : []);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "delete_failed");
      toast.success("Profil supprimé");
      await fetchProfiles();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la suppression");
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await handleDelete(pendingDeleteId);
    setPendingDeleteId(null);
    setConfirmOpen(false);
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Profils</h2>
          <Button onClick={openCreate}>Ajouter un profil</Button>
        </div>
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun profil pour le moment.</p>
        ) : (
          <ul className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {profiles.map((p) => (
              <li key={p.id} className="rounded-2xl border py-6 px-10 bg-card transform scale-x-[1.05]">
                <div className="flex items-center gap-6">
                  <Image src={`/avatar/avatar-${p.avatar}.webp`} alt={p.name} width={64} height={64} className="rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg sm:text-xl truncate">{p.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(p.ageRanges ?? []).map((ar: AgeRange) => (
                        <span
                          key={ar}
                          className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-medium text-secondary"
                        >
                          {ageRangeToLabel(ar)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  <Button size="md" variant="outline" onClick={() => openEdit(p)} disabled={submitting}>Modifier</Button>
                  <Button size="md" variant="outline" onClick={() => requestDelete(p.id)} disabled={submitting}>Supprimer</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">Ajouter un profil</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-sm">Nom</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de l'enfant"
                autoFocus
              />
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm">Choisir un avatar</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
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

            <div className="space-y-3 mb-8">
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
              <Button variant="secondary" onClick={() => { if (!submitting) { resetForm(); setOpen(false); } }} disabled={submitting}>
                Annuler
              </Button>
              <Button onClick={submit} disabled={!canSubmit || submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { if (!submitting) { setConfirmOpen(false); setPendingDeleteId(null); } }} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-[92vw] max-w-lg rounded-xl border bg-card p-6 shadow-xl"
          >
            <h2 className="text-base font-semibold">Confirmer la suppression</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cette action supprimera le profil et tous ses paramètres associés (abonnements aux podcasts, playlists, etc.).
              Cette opération est définitive.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => { if (!submitting) { setConfirmOpen(false); setPendingDeleteId(null); } }} disabled={submitting}>
                Annuler la suppression
              </Button>
              <Button onClick={confirmDelete} disabled={submitting}>
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
