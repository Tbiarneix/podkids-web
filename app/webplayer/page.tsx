'use client'

import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/utils/slugify'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { PodcastCard } from '@/components/ui/podcast-card'
import { AgeRange, Category } from '@/types/podcast'
import { Tables } from '@/types/supabase'
import Image from 'next/image'
import { CategoryFilter } from '@/components/webplayer/CategoryFilter'
import { useActiveProfile } from '@/hooks/useActiveProfile'

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

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('podcast').select()
      setPodcasts(data)
    }
    getData()
  }, [supabase])

  const categoryEntries = Object.entries(Category) as [keyof typeof Category, string][]
  const labelByKey = Object.fromEntries(categoryEntries) as Record<string, string>
  const keyByLabel = Object.fromEntries(categoryEntries.map(([k, v]) => [v, k])) as Record<string, string>
  const toLabel = (value: string): string => {
    return labelByKey[value] ?? value
  }

  const firstSentence = (raw?: string | null): string | undefined => {
    if (!raw) return undefined
    const text = String(raw)
      .replace(/<[^>]+>/g, ' ') // strip HTML
      .replace(/&[^;]+;/g, ' ') // basic entity removal
      .replace(/\s+/g, ' ') // collapse spaces
      .trim()
    if (!text) return undefined
    const match = text.match(/^[^.!?\n\r]{10,}?[.!?](\s|$)/) // take first sentence with a minimum length
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
    isSubscribed: Boolean(podcast.subscription ?? podcast.is_subscribed ?? false),
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

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={null}>
          <CategoryFilter
            podcasts={allowedByAge}
            extractCategories={(p: PodcastRow) => (Array.isArray(p.categories) ? p.categories : [])}
            onFiltered={setFiltered}
            selected={selectedCats}
            onSelectedChange={setSelectedCats}
          />
        </Suspense>
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((podcast) => (
            <div key={podcast.id} className="h-full">
              <PodcastCard
                {...toCardProps(podcast)}
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
