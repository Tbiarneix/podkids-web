"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { sanitizeHtml } from "@/utils/sanitize"
import { Category } from "@/types/podcast"

type PodcastRow = any

type EpisodeRow = {
  id: number
  name: string
  description?: string | null
  cover?: string | null
  url: string
  duration?: number | null
  publication_date?: string | null
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim()
}

const labelByKey: Record<string, string> = Object.fromEntries(
  Object.entries(Category).map(([k, v]) => [k, v as string])
) as Record<string, string>

const toLabel = (value: string): string => labelByKey[value] ?? value

export default function PodcastDetailsPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params?.slug

  const supabase = useMemo(() => createClient(), [])

  const [podcast, setPodcast] = useState<PodcastRow | null>(null)
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        // Fetch minimal fields for all podcasts (name + id) to resolve slug
        const { data: list } = await supabase
          .from("podcast")
          .select("id, name, author, cover_url, categories, episodes_count, description, subscription, is_subscribed")

        const match = (list ?? []).find((p: any) => slugify(p.name) === slug)
        if (!match) {
          router.replace("/webplayer")
          return
        }
        if (!active) return
        setPodcast(match)
        setSubscribed(Boolean(match.subscription ?? match.is_subscribed ?? false))

        const { data: eps } = await supabase
          .from("episode")
          .select("id, name, description, cover, url, duration, publication_date")
          .eq("podcast_id", match.id)
          .order("publication_date", { ascending: false })

        if (!active) return
        setEpisodes((eps ?? []) as EpisodeRow[])
      } finally {
        if (active) setLoading(false)
      }
    }
    if (slug) load()
    return () => {
      active = false
    }
  }, [slug, supabase, router])

  const direct = podcast?.cover_url && String(podcast.cover_url).trim() !== "" ? String(podcast.cover_url).trim() : ""
  const coverSrc = direct ? `/api/image-proxy?src=${encodeURIComponent(direct)}` : "/images/Logo.webp"

  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse text-white/70">Chargement…</div>
        </div>
      </div>
    )
  }

  if (!podcast) return null

  const categories: string[] = Array.isArray(podcast.categories)
    ? (podcast.categories as string[]).map((c) => toLabel(c))
    : []

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn("flex flex-col gap-6 rounded-2xl border bg-card/95 p-6 text-card-foreground shadow-sm")}> 
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <Image src={coverSrc} alt={podcast.name} width={128} height={128} className="h-32 w-32 rounded-xl object-cover sm:h-40 sm:w-40" unoptimized />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold sm:text-3xl">{podcast.name}</h1>
              <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
                {podcast.author} <span className="mx-1">•</span> {Number(podcast.episodes_count || 0)} épisodes
              </p>
              {podcast.description ? (
                <div
                  className="mt-3 text-sm text-muted-foreground space-y-2"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(podcast.description)) }}
                />
              ) : null}

              {categories.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {categories.map((cat) => (
                    <span key={cat} className="rounded-full border-2 border-yellow-400 px-3 py-1 text-sm font-semibold text-yellow-400">
                      {cat}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-5 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    subscribed ? "bg-white text-slate-900 hover:bg-white/90 focus-visible:ring-white" : "border border-white text-white hover:bg-white/10 focus-visible:ring-white"
                  )}
                  onClick={() => setSubscribed((s) => !s)}
                  aria-pressed={subscribed}
                >
                  {subscribed ? "Abonné" : "S'abonner"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Épisodes</h2>
          <ul className="flex flex-col gap-4">
            {episodes.map((ep) => {
              const epCover = ep.cover ? `/api/image-proxy?src=${encodeURIComponent(ep.cover)}` : coverSrc
              return (
                <li key={ep.id} className="flex items-start gap-4 rounded-2xl border bg-card/95 p-4 text-card-foreground shadow-sm">
                  <Image src={epCover} alt={ep.name} width={80} height={80} className="h-20 w-20 shrink-0 rounded-lg object-cover" unoptimized />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold sm:text-lg">{ep.name}</h3>
                    {ep.publication_date ? null : null}
                    {ep.description ? (
                      <div
                        className="mt-1 text-sm text-muted-foreground space-y-2"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(ep.description)) }}
                      />
                    ) : null}
                    <div className="mt-2">
                      <Link href={ep.url} className="text-sm font-semibold text-yellow-400 hover:underline" prefetch={false}>
                        Écouter ➜
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
