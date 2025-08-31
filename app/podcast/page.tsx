'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [podcasts, setPodcasts] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('podcast').select()
      setPodcasts(data)
    }
    getData()
  }, [])

  return <div>Hello Podcast</div>
}