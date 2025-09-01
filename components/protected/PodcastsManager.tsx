"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AgeRange, Category } from "@/types/podcast";
import { ageRangeToLabel } from "@/utils/ageRange";

const ORDERED_AGE_RANGES: AgeRange[] = [
  AgeRange.UNDER_3,
  AgeRange.BETWEEN_4_AND_6,
  AgeRange.BETWEEN_7_AND_9,
  AgeRange.BETWEEN_10_AND_12,
  AgeRange.BETWEEN_13_AND_15,
  AgeRange.OVER_15,
];

const ORDERED_CATEGORIES: Category[] = [
  Category.STORIES,
  Category.HISTORY,
  Category.MUSIC,
  Category.NATURE,
  Category.SCIENCE,
  Category.KNOWLEDGE,
  Category.ADVENTURE,
  Category.CULTURE,
  Category.PERSONAL_DEVELOPMENT,
  Category.ART,
  Category.SPORT,
  Category.TECHNOLOGY,
  Category.TRAVEL,
  Category.LANGUAGES,
  Category.GAMES,
  Category.HEROES,
  Category.SOCIETY,
  Category.ENTERTAINMENT,
];

export default function PodcastsManager() {
  const [open, setOpen] = useState(false);
  const [rssUrl, setRssUrl] = useState("");
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const hasUrl = rssUrl.trim().length > 0;
    return hasUrl && ageRanges.length > 0 && categories.length > 0;
  }, [rssUrl, ageRanges, categories]);

  function resetForm() {
    setRssUrl("");
    setAgeRanges([]);
    setCategories([]);
  }

  function toggleAgeRange(ar: AgeRange) {
    setAgeRanges((prev) => (prev.includes(ar) ? prev.filter((x) => x !== ar) : [...prev, ar]));
  }

  function toggleCategory(cat: Category) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]));
  }

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/podcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssUrl, ageRanges, categories }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "request_failed");
      }
      toast.success("Podcast ajouté");
      setOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l'ajout du podcast");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Podcasts</h2>
        <Button onClick={() => setOpen(true)}>Ajouter un podcast</Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />

          {/* modal */}
          <div className="relative z-10 w-[92vw] max-w-3xl rounded-2xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto md:max-h-none md:overflow-visible">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">Ajouter un podcast</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Intro text */}
            <p className="text-sm text-muted-foreground mb-4">
              Pour ajouter un podcast, veuillez  renseigner l’URL du flux rss du podcast et choisir une tranche d’âge et une thématique.
            </p>

            {/* URL field */}
            <div className="space-y-2 mb-4">
              <label className="text-sm">Url du podcast</label>
              <Input
                value={rssUrl}
                onChange={(e) => setRssUrl(e.target.value)}
                placeholder="https://exemple.com/flux.rss"
                autoFocus
                inputMode="url"
              />
            </div>

            {/* Age ranges */}
            <div className="space-y-3 mb-4">
              <p className="text-sm">Tranches d'âge</p>
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

            {/* Categories (3 per row on larger screens) */}
            <div className="space-y-3 mb-6">
              <p className="text-sm">Thématiques</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ORDERED_CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={
                        "rounded-xl px-4 py-3 text-sm font-medium text-left transition-colors " +
                        (selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/20 text-foreground border border-muted/40 hover:bg-muted/30")
                      }
                      aria-pressed={selected}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!submitting) {
                    resetForm();
                    setOpen(false);
                  }
                }}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button onClick={submit} disabled={!canSubmit || submitting}>
                {submitting ? "Ajout..." : "Ajouter un podcast"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
