import { atom } from 'jotai'
import type { LoginResponse } from '@/types'

export const authAtom = atom<LoginResponse | null>(null)
