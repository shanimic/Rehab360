/**
 * Tracks which exercise IDs have been reported today.
 * Keyed by ISO date (YYYY-MM-DD) so tomorrow's exercises are never affected.
 */

const STORAGE_KEY = 'rehab360_reported_exercises'

interface StoredData {
  [date: string]: number[]
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // e.g. "2026-04-05"
}

export function markReported(exerciseId: number): void {
  const raw = localStorage.getItem(STORAGE_KEY)
  const data: StoredData = raw ? (JSON.parse(raw) as StoredData) : {}
  const key = todayKey()
  const ids = new Set(data[key] ?? [])
  ids.add(exerciseId)
  data[key] = Array.from(ids)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getReportedToday(): Set<number> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return new Set()
  const data = JSON.parse(raw) as StoredData
  return new Set(data[todayKey()] ?? [])
}
