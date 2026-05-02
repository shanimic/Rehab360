import { atom } from 'jotai'
import type { AiConversation } from '@/types'

// text currently in the search textarea (for chip pre-fill)
export const currentQueryAtom = atom<string>('')

// accumulated conversation — array of exchanges; null when no search has run
export const searchResultsAtom = atom<AiConversation | null>(null)
