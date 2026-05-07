export function buildCalendarUrl(exerciseName: string, date: string, time: string): string {
  const datePart = date.replace(/-/g, '')
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const startDt = `${datePart}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
  const totalMins = h * 60 + m + 10
  const endH = Math.floor(totalMins / 60) % 24
  const endM = totalMins % 60
  const endDt = `${datePart}T${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: exerciseName,
    dates: `${startDt}/${endDt}`,
    details: 'Rehab360 exercise reminder',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
