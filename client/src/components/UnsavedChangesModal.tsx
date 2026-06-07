import { createPortal } from 'react-dom'
import { useAtom } from 'jotai'
import { unsavedModalAtom } from '@/store/unsavedChangesAtom'

export default function UnsavedChangesModal() {
  const [modal, setModal] = useAtom(unsavedModalAtom)

  if (!modal) return null

  const handleLeave = () => {
    modal.onLeave()
    setModal(null)
  }

  const handleStay = () => {
    modal.onStay?.()
    setModal(null)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50"
      onClick={handleStay}
      aria-modal="true"
      role="dialog"
      aria-labelledby="unsaved-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 id="unsaved-modal-title" className="text-base font-semibold text-slate-800">
            Unsaved Changes
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            You have unsaved changes. If you leave this page, your changes will not be saved.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:bg-red-700 transition-colors cursor-pointer"
            onClick={handleLeave}
          >
            Leave without saving
          </button>
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
            onClick={handleStay}
          >
            Stay on page
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
