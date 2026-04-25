import { atomWithStorage } from 'jotai/utils'
import type { LoginResponse } from '@/types'

export const authAtom = atomWithStorage<LoginResponse | null>('auth', null)
