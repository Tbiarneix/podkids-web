'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { PodcastCard } from '@/components/ui/podcast-card'
import { Category } from '@/types/podcast'
import { Tables } from '@/types/supabase'
import { CategoryFilter } from '@/components/webplayer/CategoryFilter'

export default function WebPlayer() {
  type PodcastRow = Tables<'podcast'>

  const [podcasts, setPodcasts] = useState<PodcastRow[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('podcast').select()
      setPodcasts(data)
    }
    getData()
  }, [])

  const categoryEntries = Object.entries(Category) as [keyof typeof Category, string][]
  const labelByKey = Object.fromEntries(categoryEntries) as Record<string, string>
  const toLabel = (value: string): string => {
    return labelByKey[value] ?? value
  }

  const toCardProps = (podcast: PodcastRow) => ({
    name: podcast.name,
    author: podcast.author,
    episodesCount: Number(podcast.episodes_count),
    coverUrl: podcast.cover_url ?? undefined,
    categories: Array.isArray(podcast.categories)
      ? podcast.categories.map((c) => toLabel(c))
      : [],
    href: `/podcast/${podcast.id}`,
    isSubscribed: Boolean(podcast.subscription ?? podcast.is_subscribed ?? false),
  })

  const [filtered, setFiltered] = useState<PodcastRow[]>([])
  useEffect(() => {
    setFiltered((podcasts ?? []) as PodcastRow[])
  }, [podcasts])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <CategoryFilter
          podcasts={(podcasts ?? []) as PodcastRow[]}
          extractCategories={(p: PodcastRow) => (Array.isArray(p.categories) ? p.categories : [])}
          onFiltered={setFiltered}
        />
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((podcast) => (
            <div key={podcast.id} className="h-full">
              <PodcastCard {...toCardProps(podcast)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
