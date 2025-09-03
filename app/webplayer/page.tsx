'use client'

import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/utils/slugify'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { PodcastCard } from '@/components/ui/podcast-card'
import { AgeRange, Category } from '@/types/podcast'
import { Tables } from '@/types/supabase'
import { CategoryFilter } from '@/components/webplayer/CategoryFilter'
import { useActiveProfile } from '@/hooks/useActiveProfile'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const AGE_RANGE_CODE_MAP: Record<AgeRange, string> = {
  [AgeRange.UNDER_3]: 'UNDER_3',
  [AgeRange.BETWEEN_4_AND_6]: 'BETWEEN_4_AND_6',
  [AgeRange.BETWEEN_7_AND_9]: 'BETWEEN_7_AND_9',
  [AgeRange.BETWEEN_10_AND_12]: 'BETWEEN_10_AND_12',
  [AgeRange.BETWEEN_13_AND_15]: 'BETWEEN_13_AND_15',
  [AgeRange.OVER_15]: 'OVER_15',
}

export default function WebPlayer() {
  type PodcastRow = Tables<'podcast'>

  const [podcasts, setPodcasts] = useState<PodcastRow[] | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { active } = useActiveProfile()
  const [subscribedSet, setSubscribedSet] = useState<Set<number>>(new Set())
  const LS_KEY_ONLY_SUBS = 'pk_only_subscribed'
  const [onlySubs, setOnlySubs] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('podcast').select()
      setPodcasts(data)
    }
    getData()
  }, [supabase])

  useEffect(() => {
    let cancelled = false
    const checkProfiles = async () => {
      try {
        const res = await fetch('/api/profiles', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data?.profiles) ? data.profiles : []
        if (!cancelled && list.length === 0) {
          toast.message('Veuillez créer un profil au minimum pour accéder au webplayer')
          router.replace('/webplayer/onboarding')
        }
      } catch {}
    }
    checkProfiles()
    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY_ONLY_SUBS) : null
      if (raw != null) setOnlySubs(raw === '1')
    } catch {}
  }, [])
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY_ONLY_SUBS, onlySubs ? '1' : '0')
    } catch {}
  }, [onlySubs])

  useEffect(() => {
    let mounted = true
    const loadSubs = async () => {
      try {
        if (!active?.id) {
          setSubscribedSet(new Set())
          return
        }
        const profileId = Number(active.id)
        if (Number.isNaN(profileId)) return
        const { data, error } = await supabase
          .from('podcast_subscriptions')
          .select('podcast_id')
          .eq('profile_id', profileId)
        if (!mounted) return
        if (error) return
        const ids = new Set<number>((data ?? []).map((r: any) => Number(r.podcast_id)))
        setSubscribedSet(ids)
      } catch {}
    }
    loadSubs()
    return () => { mounted = false }
  }, [active?.id, supabase])

  const categoryEntries = Object.entries(Category) as [keyof typeof Category, string][]
  const labelByKey = Object.fromEntries(categoryEntries) as Record<string, string>
  const keyByLabel = Object.fromEntries(categoryEntries.map(([k, v]) => [v, k])) as Record<string, string>
  const toLabel = (value: string): string => {
    return labelByKey[value] ?? value
  }

  const firstSentence = (raw?: string | null): string | undefined => {
    if (!raw) return undefined
    const text = String(raw)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!text) return undefined
    const match = text.match(/^[^.!?\n\r]{10,}?[.!?](\s|$)/)
    return (match ? match[0] : text).trim()
  }

  const toCardProps = (podcast: PodcastRow) => ({
    name: podcast.name,
    author: podcast.author,
    episodesCount: Number(podcast.episodes_count),
    coverUrl: podcast.cover_url ?? undefined,
    categories: Array.isArray(podcast.categories)
      ? podcast.categories.map((c) => toLabel(c))
      : [],
    href: `/webplayer/podcast/${slugify(podcast.author)}/${slugify(podcast.name)}?id=${encodeURIComponent(String(podcast.id))}`,
    isSubscribed: subscribedSet.has(Number(podcast.id)),
    description: firstSentence((podcast as any).description ?? undefined),
  })

  const allowedByAge: PodcastRow[] = useMemo(() => {
    const list = (podcasts ?? []) as PodcastRow[]
    const activeRanges = active?.ageRanges ?? []
    if (!activeRanges.length) return list
    const allowedCodes = new Set(activeRanges.map((r) => AGE_RANGE_CODE_MAP[r as AgeRange] ?? String(r)))
    return list.filter((p) => {
      const ranges: string[] = Array.isArray((p as any).age_range) ? (p as any).age_range : []
      if (!ranges.length) return false
      return ranges.some((code) => allowedCodes.has(code))
    })
  }, [podcasts, active])

  const [filtered, setFiltered] = useState<PodcastRow[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  useEffect(() => {
    setFiltered(allowedByAge)
  }, [allowedByAge])

  const displayed: PodcastRow[] = useMemo(() => {
    const base = filtered
    if (!onlySubs) return base
    return base.filter((p) => subscribedSet.has(Number(p.id)))
  }, [filtered, onlySubs, subscribedSet])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Suspense fallback={null}>
            <CategoryFilter
              podcasts={allowedByAge}
              extractCategories={(p: PodcastRow) => (Array.isArray(p.categories) ? p.categories : [])}
              onFiltered={setFiltered}
              selected={selectedCats}
              onSelectedChange={setSelectedCats}
            />
          </Suspense>
          <Button
            type="button"
            variant={onlySubs ? 'default' : 'outline'}
            size="md"
            onClick={() => setOnlySubs((v) => !v)}
            disabled={!active?.id}
            title={onlySubs ? 'Voir tous les podcasts' : 'Voir mes abonnements'}
          >
            {onlySubs ? 'Voir tous les podcasts' : 'Voir mes abonnements'}
          </Button>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {displayed.map((podcast) => (
            <div key={podcast.id} className="h-full">
              <PodcastCard
                {...toCardProps(podcast)}
                onSubscribe={async (next) => {
                  if (!active?.id) return
                  const profileId = Number(active.id)
                  const podcastId = Number(podcast.id)
                  if (Number.isNaN(profileId) || Number.isNaN(podcastId)) return
                  setSubscribedSet((prev) => {
                    const s = new Set(prev)
                    if (next) s.add(podcastId); else s.delete(podcastId)
                    return s
                  })
                  try {
                    const res = await fetch('/api/subscriptions', {
                      method: next ? 'POST' : 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ profileId, podcastId }),
                    })
                    if (!res.ok) throw new Error('request_failed')
                  } catch {
                    setSubscribedSet((prev) => {
                      const s = new Set(prev)
                      if (next) s.delete(podcastId); else s.add(podcastId)
                      return s
                    })
                  }
                }}
                onCategoryClick={(label) => {
                  const key = keyByLabel[label]
                  if (key) setSelectedCats([key])
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

