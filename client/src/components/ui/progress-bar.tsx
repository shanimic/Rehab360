interface ProgressBarProps {
  value: number
  showLabel?: boolean
}

export default function ProgressBar({ value, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Overall Completion</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{clamped}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: 8,
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
