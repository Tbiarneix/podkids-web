"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/utils/slugify"
import { cn } from "@/lib/utils"
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


const labelByKey: Record<string, string> = Object.fromEntries(
  Object.entries(Category).map(([k, v]) => [k, v as string])
) as Record<string, string>

const toLabel = (value: string): string => labelByKey[value] ?? value

export default function PodcastDetailsPage() {
  const params = useParams<{ author: string; slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const idFromQuery = searchParams?.get('id') ?? undefined
  const slug = slugify(decodeURIComponent(String(params?.slug ?? "")))
  const authorSlug = slugify(decodeURIComponent(String(params?.author ?? "")))

  const supabase = useMemo(() => createClient(), [])

  const [podcast, setPodcast] = useState<PodcastRow | null>(null)
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        let match: any | undefined

        // 1) If we have an id in the URL, fetch directly by id (most reliable)
        if (idFromQuery) {
          const { data: byId } = await supabase
            .from('podcast')
            .select('id, name, author, cover_url, categories, episodes_count, description')
            .eq('id', idFromQuery)
            .maybeSingle()
          if (byId) {
            match = byId
          }
        }

        // 2) Fallback: fetch all and resolve by slugs
        if (!match) {
          const { data: list } = await supabase
            .from("podcast")
            .select("id, name, author, cover_url, categories, episodes_count, description")
          const items = list ?? []
          if (process.env.NODE_ENV !== "production") {
            console.debug("[PodcastDetail] Params:", { authorSlug, slug, idFromQuery })
            console.debug("[PodcastDetail] Items count:", items.length)
          }
          // Primary: exact match name+author
          match = (items as any[]).find((p) => slugify(p.name) === slug && slugify(p.author) === authorSlug)
          // Secondary: filter by name, pick best author match
          const byName = (items as any[]).filter((p) => slugify(p.name) === slug)
          if (!match && byName.length > 0) {
            match = byName.find((p) => slugify(p.author) === authorSlug)
              ?? byName.find((p) => slugify(p.author).startsWith(authorSlug))
              ?? byName.find((p) => slugify(p.author).includes(authorSlug))
              ?? (byName.length === 1 ? byName[0] : undefined)
          }
        }
        if (!match) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[PodcastDetail] No podcast matched for", { authorSlug, slug, idFromQuery })
          }
          return
        }
        if (!active) return
        setPodcast(match)
        // Keep local toggle only for now; backend wiring later

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
    if (slug && authorSlug) load()
    return () => {
      active = false
    }
  }, [slug, authorSlug, supabase])

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

  if (!podcast) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-white/80">Podcast introuvable.</p>
          <div className="mt-4">
            <Link href="/webplayer" className="text-yellow-400 hover:underline">Retour au Webplayer</Link>
          </div>
        </div>
      </div>
    )
  }

  const categories: string[] = Array.isArray(podcast.categories)
    ? (podcast.categories as string[]).map((c) => toLabel(c))
    : []

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn("relative flex items-start gap-6 p-0")}> 
          {/* Heart toggle, like in PodcastCard */}
          <button
            type="button"
            aria-label={subscribed ? "Se désabonner" : "S'abonner"}
            title={subscribed ? "Se désabonner" : "S'abonner"}
            aria-pressed={subscribed}
            className={cn(
              "absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full",
              "text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            onClick={() => setSubscribed((s) => !s)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill={subscribed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="sr-only">{subscribed ? "Se désabonner" : "S'abonner"}</span>
          </button>

          <div className="shrink-0">
            <Image src={coverSrc} alt={podcast.name} width={128} height={128} className="h-32 w-32 rounded-xl object-cover sm:h-40 sm:w-40" unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">{podcast.name}</h1>
            <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
              {podcast.author} <span className="mx-1">•</span> {Number(podcast.episodes_count || 0)} épisodes
            </p>
            {podcast.description ? (
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {String(podcast.description)}
              </p>
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
                    {ep.publication_date ? (
                      <p className="text-xs text-muted-foreground">{ep.publication_date}</p>
                    ) : null}
                    {ep.description ? (
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{ep.description}</p>
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
