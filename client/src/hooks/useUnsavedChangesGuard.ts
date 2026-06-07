import { useEffect, useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { unsavedChangesAtom, unsavedModalAtom } from '@/store/unsavedChangesAtom'

// Re-exported so callers can use the same sentinel key when cleaning up history
export const GUARD_HISTORY_KEY = '__unsavedGuard'

type RequestNavigation = (onLeave: () => void) => void

export function useUnsavedChangesGuard(isDirty: boolean): RequestNavigation {
  const setUnsavedChanges = useSetAtom(unsavedChangesAtom)
  const setModal = useSetAtom(unsavedModalAtom)

  // Keep the global dirty flag in sync so TopNav and other consumers can read it
  useEffect(() => {
    setUnsavedChanges(isDirty)
    return () => {
      setUnsavedChanges(false)
    }
  }, [isDirty, setUnsavedChanges])

  // Native browser warning for refresh / tab close — kept as native per requirements
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Browser back button via popstate.
  // Technique: push a sentinel history entry when dirty so the user's first "back"
  // lands on the same URL instead of leaving. On popstate we open the in-app modal;
  // "Stay" goes forward back to the sentinel, "Leave" goes one further back to the
  // real previous page.
  useEffect(() => {
    if (!isDirty) return
    window.history.pushState({ [GUARD_HISTORY_KEY]: true }, '')

    const handlePopState = (e: PopStateEvent) => {
      // Forward navigation back to the sentinel — nothing to do
      if ((e.state as Record<string, unknown> | null)?.[GUARD_HISTORY_KEY]) return

      // User went back past the sentinel — show the in-app modal
      setModal({
        onLeave: () => window.history.go(-1),
        onStay: () => window.history.go(1),
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty, setModal])

  // Returned helper: show the modal for any in-app navigation triggered by buttons.
  // If not dirty, calls onLeave immediately without showing the modal.
  return useCallback<RequestNavigation>(
    (onLeave) => {
      if (!isDirty) {
        onLeave()
        return
      }
      setModal({ onLeave })
    },
    [isDirty, setModal],
  )
}
