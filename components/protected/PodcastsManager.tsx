"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AgeRange, Category } from "@/types/podcast";
import { ageRangeToLabel } from "@/utils/ageRange";
import { Plus } from "lucide-react";
import { useFocusTrap } from "@/lib/a11y/focusTrap";

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

  // Focus trap refs
  const modalRef = useRef<HTMLDivElement | null>(null);
  const rssInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => {
    const hasUrl = rssUrl.trim().length > 0;
    return hasUrl && ageRanges.length > 0 && categories.length > 0;
  }, [rssUrl, ageRanges, categories]);

  // Install focus trap (hooks must stay at top-level)
  useFocusTrap(modalRef, open, {
    initialFocusRef: rssInputRef,
    onEscape: () => setOpen(false),
  });

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Podcasts</h2>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full max-[768px]:h-10 max-[768px]:w-10 max-[768px]:justify-center max-[768px]:border-0 max-[768px]:bg-primary max-[768px]:p-0 max-[768px]:text-primary-foreground max-[768px]:shadow max-[768px]:hover:bg-primary/90"
          onClick={() => setOpen(true)}
          aria-label="Ajouter un podcast"
        >
          <Plus className="size-4" aria-hidden />
          <span className="max-[768px]:sr-only">Ajouter un podcast</span>
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:items-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            className="relative z-10 h-[95vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-background p-6 shadow-xl"
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-podcast-title"
          >
            <div className="mb-4 flex shrink-0 items-start justify-between">
              <h2 id="add-podcast-title" className="text-2xl font-bold">Ajouter un podcast</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="custom-scrollbar max-h-[74dvh] min-h-0 overflow-y-auto overscroll-contain py-3 pr-3">
              <p className="text-muted-foreground mb-4 text-sm">
                Pour ajouter un podcast, veuillez renseigner l’URL du flux rss du podcast et choisir
                une tranche d’âge et une thématique.
              </p>

              <div className="mb-4 space-y-2">
                <label htmlFor="rssUrl" className="text-sm">
                  Url du podcast
                </label>
                <Input
                  id="rssUrl"
                  value={rssUrl}
                  onChange={(e) => setRssUrl(e.target.value)}
                  placeholder="https://exemple.com/flux.rss"
                  autoFocus
                  ref={rssInputRef}
                  inputMode="url"
                />
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-sm">Tranches d&apos;âge</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                            : "bg-muted/20 border-muted/40 hover:bg-muted/30 border text-foreground")
                        }
                        aria-pressed={selected}
                      >
                        {ageRangeToLabel(ar)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-sm">Thématiques</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {ORDERED_CATEGORIES.map((cat) => {
                    const selected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={
                          "rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors " +
                          (selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/20 border-muted/40 hover:bg-muted/30 border text-foreground")
                        }
                        aria-pressed={selected}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 pt-4">
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
