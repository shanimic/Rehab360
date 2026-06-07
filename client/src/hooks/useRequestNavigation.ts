import { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { unsavedChangesAtom, unsavedModalAtom } from '@/store/unsavedChangesAtom'

// Lightweight hook for components (e.g. TopNav) that trigger navigation but are not
// the owners of the dirty form. Reads dirty state from the atom set by the form's
// useUnsavedChangesGuard and opens the shared modal when needed.
export function useRequestNavigation(): (onLeave: () => void) => void {
  const isDirty = useAtomValue(unsavedChangesAtom)
  const setModal = useSetAtom(unsavedModalAtom)

  return useCallback(
    (onLeave: () => void) => {
      if (!isDirty) {
        onLeave()
        return
      }
      setModal({ onLeave })
    },
    [isDirty, setModal],
  )
}
