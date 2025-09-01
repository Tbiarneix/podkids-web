"use client"

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Category } from '@/types/podcast'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type CategoryFilterProps<T> = {
  podcasts: T[]
  extractCategories: (podcast: T) => string[]
  onFiltered: (filtered: T[]) => void
  variant?: 'block' | 'inline'
  buttonClassName?: string
  resetButtonClassName?: string
  syncUrl?: boolean
  selected?: string[]
  onSelectedChange?: (selected: string[]) => void
}

export function CategoryFilter<T>({ podcasts, extractCategories, onFiltered, variant = 'block', buttonClassName, resetButtonClassName, syncUrl = true, selected: controlledSelected, onSelectedChange }: CategoryFilterProps<T>) {
  const categoryEntries = Object.entries(Category) as [keyof typeof Category, string][]
  const categoryKeys = categoryEntries.map(([k]) => k)
  const keyByLabel = Object.fromEntries(categoryEntries.map(([k, v]) => [v, k])) as Record<string, string>

  const toKey = (value: string): string | null => {
    if (categoryKeys.includes(value as any)) return value
    const k = keyByLabel[value]
    return k ?? null
  }

  const [selectedInternal, setSelectedInternal] = useState<string[]>([])
  const selected = controlledSelected ?? selectedInternal
  const isAll = selected.length === 0

  const toggleAll = () => {
    if (controlledSelected !== undefined) onSelectedChange?.([])
    else setSelectedInternal([])
  }
  const toggleCategory = (key: string) => {
    const prev = selected
    const s = new Set(prev)
    s.has(key) ? s.delete(key) : s.add(key)
    const next = Array.from(s)
    if (controlledSelected !== undefined) onSelectedChange?.(next)
    else setSelectedInternal(next)
  }

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const catsFromUrl = useMemo(() => {
    if (!syncUrl) return [] as string[]
    const raw = searchParams.get('cats')
    if (!raw) return [] as string[]
    const keys = raw
      .split(',')
      .map((s) => decodeURIComponent(s))
      .filter(Boolean)
    return keys.filter((k) => categoryKeys.includes(k as any))
  }, [searchParams, syncUrl])

  useEffect(() => {
    if (!syncUrl) return
    const a = catsFromUrl
    const b = selected
    const equal = a.length === b.length && a.every((v) => b.includes(v))
    if (!equal) {
      if (controlledSelected !== undefined) onSelectedChange?.(a)
      else setSelectedInternal(a)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catsFromUrl.join('|'), syncUrl, controlledSelected])

  useEffect(() => {
    if (!syncUrl) return
    const current = searchParams.toString()
    const params = new URLSearchParams(current)
    if (selected.length === 0) params.delete('cats')
    else params.set('cats', selected.map((s) => encodeURIComponent(s)).join(','))
    const next = params.toString()
    if (next === current) return
    const url = next ? `${pathname}?${next}` : pathname
    router.replace(url, { scroll: false })
  }, [selected, router, pathname, searchParams, syncUrl])

  useEffect(() => {
    if (!podcasts) return
    const filtered = (podcasts ?? []).filter((p) => {
      if (selected.length === 0) return true
      const cats: string[] = extractCategories(p) ?? []
      const keys = cats.map((c) => toKey(c)).filter((v): v is string => Boolean(v))
      return keys.some((k) => selected.includes(k))
    })
    onFiltered(filtered)
  }, [podcasts, selected, extractCategories, onFiltered])

  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null)
  const lastActiveRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Focus 
  useEffect(() => {
    if (open) {
      lastActiveRef.current = (document.activeElement as HTMLElement) ?? null
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const target = closeBtnRef.current ?? focusable?.[0] ?? null
      target?.focus()
    } else {
      (triggerBtnRef.current ?? lastActiveRef.current)?.focus?.()
    }
  }, [open])

  // Focus trap
  const onKeyDownTrap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open || e.key !== 'Tab') return
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable || focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement as HTMLElement
    if (e.shiftKey) {
      if (active === first || !drawerRef.current?.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (active === last || !drawerRef.current?.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  // Scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className={variant === 'inline' ? '' : 'mb-6'}>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className={buttonClassName ?? "rounded-full border-white text-white hover:bg-white/10 hover:text-white"}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="filters-drawer"
          ref={triggerBtnRef}
        >
          Filtrer{selected.length ? ` (${selected.length})` : ''}
        </Button>
        {!isAll && (
          <Button
            variant="ghost"
            className={resetButtonClassName ?? "text-white hover:bg-white/10 hover:text-white"}
            onClick={toggleAll}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        id="filters-drawer"
        role="dialog"
        aria-modal={open}
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-md transform bg-slate-900 shadow-xl transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        ref={drawerRef}
        onKeyDown={onKeyDownTrap}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">Filtres</h2>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Fermer le panneau des filtres"
            ref={closeBtnRef}
          >
            ✕
          </Button>
        </div>

        <div className="px-4 py-4 overflow-y-auto max-h-[calc(100vh-56px)]">
          <div className="mb-4">
            <Button
              variant={isAll ? 'default' : 'outline'}
              className={isAll ? 'rounded-full bg-white text-slate-900 hover:bg-white/90' : 'rounded-full border-white text-white hover:bg-white/10 hover:text-white'}
              aria-pressed={isAll}
              onClick={toggleAll}
            >
              Tous
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {categoryEntries.map(([key, label]) => {
              const active = selected.includes(key)
              return (
                <label key={key} className="flex items-center gap-3 text-white">
                  <Checkbox
                    checked={active}
                    onCheckedChange={() => toggleCategory(key)}
                    aria-pressed={active}
                  />
                  <span>{label}</span>
                </label>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="default"
              className="rounded-full bg-white text-slate-900 hover:bg-white/90"
              onClick={() => setOpen(false)}
            >
              Appliquer
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={toggleAll}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
