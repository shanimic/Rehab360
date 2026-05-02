import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ChevronDown } from 'lucide-react'
import type { PhysiotherapyExerciseItem } from '@/types'
import './AddExerciseModal.css'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExerciseEntry {
  id: string
  exercise_id: number
  name: string
  sets: number
  reps: number
  weight: number
  frequencyAmount: number
  frequencyUnit: 'Daily' | 'Weekly'
  description: string
}

interface AddExerciseModalProps {
  onAdd: (exercise: ExerciseEntry) => void
  onClose: () => void
  exercises: PhysiotherapyExerciseItem[]
  isLoadingExercises?: boolean
}

// ── Local form state ───────────────────────────────────────────────────────────

interface FormState {
  exerciseId: number | null
  name: string
  sets: string
  reps: string
  weight: string
  frequencyAmount: string
  frequencyUnit: 'Daily' | 'Weekly'
  description: string
}

const EMPTY_FORM: FormState = {
  exerciseId: null,
  name: '',
  sets: '',
  reps: '',
  weight: '',
  frequencyAmount: '',
  frequencyUnit: 'Daily',
  description: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddExerciseModal({
  onAdd,
  onClose,
  exercises,
  isLoadingExercises = false,
}: AddExerciseModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [nameSearch, setNameSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = exercises.filter((ex) =>
    ex.exercise_name.toLowerCase().includes(nameSearch.toLowerCase()),
  )

  // Lock page scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelectExercise(exercise: PhysiotherapyExerciseItem): void {
    setForm((prev) => ({ ...prev, name: exercise.exercise_name, exerciseId: exercise.exercise_id }))
    setNameSearch(exercise.exercise_name)
    setShowDropdown(false)
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }

  function handleFieldChange<K extends keyof FormState>(field: K, value: FormState[K]): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.name) newErrors.name = 'Exercise name is required'
    if (!form.sets || Number(form.sets) < 1) newErrors.sets = 'Required'
    if (!form.reps || Number(form.reps) < 1) newErrors.reps = 'Required'
    if (!form.frequencyAmount || Number(form.frequencyAmount) < 1) {
      newErrors.frequencyAmount = 'Required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleAdd(): void {
    if (!validate()) return
    onAdd({
      id: crypto.randomUUID(),
      exercise_id: form.exerciseId!,
      name: form.name,
      sets: Number(form.sets),
      reps: Number(form.reps),
      weight: Number(form.weight) || 0,
      frequencyAmount: Number(form.frequencyAmount),
      frequencyUnit: form.frequencyUnit,
      description: form.description.trim(),
    })
  }

  const inputBase = 'aem-input'
  const inputError = 'aem-input--error'

  const modal = (
    /* Rendered into document.body via portal — escapes PageTransition's
       CSS transform, which would otherwise trap fixed children */
    <div className="aem-overlay">
      {/* Backdrop — fixed, covers full viewport */}
      <div className="aem-backdrop" onClick={onClose} aria-hidden="true" />

      {/* White content box — h-auto, no max-height */}
      <div className="aem-card">
        {/* Header */}
        <div className="aem-header">
          <h2 className="aem-title">Add Exercise</h2>
          <button
            type="button"
            onClick={onClose}
            className="aem-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="aem-body">

        {/* Exercise Name — searchable dropdown */}
        <div className="aem-field">
          <label className="aem-label">
            Exercise Name <span className="aem-required">*</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <div
              className={`aem-search-box${errors.name ? ' aem-search-box--error' : ''}`}
              onClick={() => setShowDropdown(true)}
            >
              <Search size={14} className="aem-search-icon" />
              <input
                type="text"
                className="aem-search-input"
                placeholder="Search exercise…"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value)
                  setForm((prev) => ({ ...prev, name: '', exerciseId: null }))
                  setShowDropdown(true)
                }}
                onFocus={() => {
                  setNameSearch('')
                  setShowDropdown(true)
                }}
                onBlur={() => {
                  if (form.name) setNameSearch(form.name)
                }}
              />
              <ChevronDown
                size={14}
                className={`aem-chevron${showDropdown ? ' aem-chevron--open' : ''}`}
              />
            </div>

            {showDropdown && (
              <div className="aem-dropdown">
                {isLoadingExercises ? (
                  <div className="aem-dropdown__empty">Loading exercises…</div>
                ) : filteredOptions.length === 0 ? (
                  <div className="aem-dropdown__empty">No exercises found</div>
                ) : (
                  filteredOptions.map((ex) => (
                    <button
                      key={ex.exercise_id}
                      type="button"
                      className="aem-dropdown__item"
                      onMouseDown={() => handleSelectExercise(ex)}
                    >
                      {ex.exercise_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.name && <p className="aem-error-msg">{errors.name}</p>}
        </div>

        {/* Sets / Reps / Weight */}
        <div className="aem-row-3">
          <div className="aem-field">
            <label className="aem-label">
              Sets <span className="aem-required">*</span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="3"
              className={`${inputBase}${errors.sets ? ` ${inputError}` : ''}`}
              value={form.sets}
              onChange={(e) => handleFieldChange('sets', e.target.value)}
            />
            {errors.sets && <p className="aem-error-msg">{errors.sets}</p>}
          </div>

          <div className="aem-field">
            <label className="aem-label">
              Reps <span className="aem-required">*</span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="12"
              className={`${inputBase}${errors.reps ? ` ${inputError}` : ''}`}
              value={form.reps}
              onChange={(e) => handleFieldChange('reps', e.target.value)}
            />
            {errors.reps && <p className="aem-error-msg">{errors.reps}</p>}
          </div>

          <div className="aem-field">
            <label className="aem-label">Weight (kg)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              className={inputBase}
              value={form.weight}
              onChange={(e) => handleFieldChange('weight', e.target.value)}
            />
          </div>
        </div>

        {/* Frequency */}
        <div className="aem-field">
          <label className="aem-label">
            Frequency <span className="aem-required">*</span>
          </label>
          <div className="aem-row-2">
            <div className="aem-field">
              <input
                type="number"
                min={1}
                placeholder="Amount"
                className={`${inputBase}${errors.frequencyAmount ? ` ${inputError}` : ''}`}
                value={form.frequencyAmount}
                onChange={(e) => handleFieldChange('frequencyAmount', e.target.value)}
              />
              {errors.frequencyAmount && (
                <p className="aem-error-msg">{errors.frequencyAmount}</p>
              )}
            </div>
            <select
              className="aem-select"
              value={form.frequencyUnit}
              onChange={(e) =>
                handleFieldChange('frequencyUnit', e.target.value as 'Daily' | 'Weekly')
              }
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Instructions */}
        <div className="aem-field">
          <label className="aem-label">Instructions</label>
          <textarea
            rows={3}
            placeholder="Specific instructions or technique notes…"
            className="aem-textarea"
            value={form.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="aem-actions">
          <button type="button" className="aem-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="aem-btn-add" onClick={handleAdd}>
            Add Exercise
          </button>
        </div>
      </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
