import { atom } from 'jotai'
import type { AiSearchResult } from '@/types'

export const currentQueryAtom = atom<string>('')
export const searchResultsAtom = atom<AiSearchResult | null>(null)
