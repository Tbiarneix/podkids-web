"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategoryFilter } from "@/components/webplayer/CategoryFilter";
import { cn } from "@/lib/utils";
import { Category } from "@/types/podcast";
import { sanitizeHtml } from "@/utils/sanitize";
import { toast } from "sonner";
import React from "react";

type DbPodcast = {
  id: number;
  name: string | null;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  categories: string[] | null;
  public: boolean | null;
  episodes_count: number | null;
};

export default function PodcastsList({
  podcasts,
  privateIds,
}: {
  podcasts: DbPodcast[];
  privateIds: number[];
}) {
  const [onlyPrivate, setOnlyPrivate] = useState(false);
  const privateSet = useMemo(() => new Set(privateIds), [privateIds]);
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const deleteBtnRef = useRef<HTMLButtonElement | null>(null);
  const [catFiltered, setCatFiltered] = useState<DbPodcast[]>(podcasts ?? []);
  useEffect(() => {
    setCatFiltered(podcasts ?? []);
  }, [podcasts]);
  const handleFiltered = useCallback((f: DbPodcast[]) => {
    setCatFiltered(f);
  }, []);
  const extractCats = useCallback((p: DbPodcast) => p.categories ?? [], []);

  useEffect(() => {
    if (confirmId !== null) {
      prevFocusRef.current =
        typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
      const t = window.setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    } else {
      prevFocusRef.current?.focus?.();
    }
  }, [confirmId]);

  const filtered = useMemo(() => {
    const base = catFiltered ?? podcasts ?? [];
    return base.filter((p) => (onlyPrivate ? privateSet.has(p.id) : true));
  }, [catFiltered, podcasts, onlyPrivate, privateSet]);

  const performDelete = async (podcastId: number) => {
    try {
      const res = await fetch("/api/podcasts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ podcastId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}) as any);
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      router.refresh();
      toast.success("Podcast supprimé de vos favoris");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression du podcast privé");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          podcasts={podcasts}
          extractCategories={extractCats}
          onFiltered={handleFiltered}
          variant="inline"
          buttonClassName="rounded-full border-primary text-primary hover:bg-primary/10"
          resetButtonClassName="text-muted-foreground hover:bg-accent hover:text-foreground"
        />
        <div className="flex items-center gap-2">
          <Switch
            id="only-private"
            checked={onlyPrivate}
            onCheckedChange={(v) => setOnlyPrivate(!!v)}
          />
          <label
            htmlFor="only-private"
            className="text-muted-foreground cursor-pointer break-words text-sm"
            onClick={() => setOnlyPrivate((prev) => !prev)}
          >
            Afficher uniquement mes podcasts privés
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((p) => {
          const direct = p.cover_url && p.cover_url.trim() !== "" ? p.cover_url.trim() : "";
          const coverSrc = direct
            ? `/api/image-proxy?src=${encodeURIComponent(direct)}`
            : "/images/Logo.webp";
          const cats = Array.isArray(p.categories)
            ? p.categories
                .map((code) => (Category as any)?.[code] || code)
                .filter((x) => typeof x === "string")
            : [];
          const isPrivate = privateSet.has(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "group relative flex h-full w-full flex-col gap-4 rounded-2xl border bg-card/95 p-6 text-card-foreground shadow-sm transition-colors hover:bg-card",
              )}
            >
              {isPrivate ? (
                <Button
                  aria-label="Supprimer le podcast"
                  title="Supprimer le podcast"
                  variant="default"
                  size="icon"
                  className="absolute right-3 top-3 h-10 w-10 rounded-full bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setConfirmId(p.id)}
                >
                  <span className="sr-only">Supprimer ce podcast</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              ) : null}
              <div className="flex items-stretch gap-6">
                <div className="shrink-0">
                  <Image
                    src={coverSrc}
                    alt={p.name || "Podcast"}
                    width={128}
                    height={128}
                    className="h-32 w-32 rounded-xl object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold sm:text-xl">
                      {p.name || "Sans titre"}
                    </h2>
                    <p className="text-muted-foreground mt-0.5 flex flex-wrap truncate text-sm">
                      {(p.author || "").trim()}{" "}
                      {p.episodes_count != null ? <span className="mx-1">•</span> : null}
                      {p.episodes_count != null ? `${p.episodes_count} épisodes` : null}
                    </p>
                  </div>
                  {p.description ? (
                    <div
                      className="text-muted-foreground line-clamp-5 text-sm"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(p.description)) }}
                    />
                  ) : null}
                </div>
              </div>
              {cats.length > 0 ? (
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  {cats.map((cat) => (
                    <span
                      key={cat as string}
                      className="rounded-full border-2 border-yellow-400 px-3.5 py-1 text-sm font-semibold text-yellow-400"
                    >
                      {cat as string}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmId !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-labelledby="confirm-title"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setConfirmId(null);
              return;
            }
            if (e.key === "Tab") {
              const cancelEl = cancelBtnRef.current;
              const deleteEl = deleteBtnRef.current;
              if (!cancelEl || !deleteEl) return;
              const active = document.activeElement as HTMLElement | null;
              if (e.shiftKey) {
                if (active === cancelEl) {
                  e.preventDefault();
                  deleteEl.focus();
                }
              } else {
                if (active === deleteEl) {
                  e.preventDefault();
                  cancelEl.focus();
                }
              }
            }
          }}
        >
          <button
            aria-label="Fermer"
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmId(null)}
          />
          <div className="relative z-10 w-[90%] max-w-sm rounded-2xl border bg-card p-5 text-card-foreground shadow-xl">
            <h2 id="confirm-title" className="text-lg font-semibold">
              Supprimer ce podcast ?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Cette action supprimera ce podcast de vos podcasts privés. Cette opération est
              réversible en le ré-ajoutant plus tard.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                ref={cancelBtnRef}
                onClick={() => setConfirmId(null)}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                ref={deleteBtnRef}
                onClick={async () => {
                  const id = confirmId;
                  setConfirmId(null);
                  if (id != null) await performDelete(id);
                }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
