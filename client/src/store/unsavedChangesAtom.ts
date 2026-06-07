import { atom } from 'jotai'

export const unsavedChangesAtom = atom(false)

export interface UnsavedModalState {
  onLeave: () => void
  onStay?: () => void
}

export const unsavedModalAtom = atom<UnsavedModalState | null>(null)
