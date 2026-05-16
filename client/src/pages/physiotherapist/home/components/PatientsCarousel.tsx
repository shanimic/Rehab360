import { useRef, useState, useEffect } from 'react'
import PatientCard from './PatientCard'
import type { HomePatientCard } from '@/types'
import './PatientsCarousel.css'

interface PatientsCarouselProps {
  patients: HomePatientCard[]
  onPatientClick: (patientId: string) => void
}

export default function PatientsCarousel({ patients, onPatientClick }: PatientsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const check = () => setHasOverflow(track.scrollWidth > track.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(track)
    return () => ro.disconnect()
  }, [patients])

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  const arrowStyle: React.CSSProperties = { visibility: hasOverflow ? 'visible' : 'hidden' }

  return (
    <div className="patients-carousel">
      <button
        className="patients-carousel__arrow"
        style={arrowStyle}
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="patients-carousel__track" ref={trackRef}>
        {patients.map((patient) => (
          <div key={patient.patient_id} className="patients-carousel__item">
            <PatientCard
              patient={patient}
              onClick={() => onPatientClick(patient.patient_id)}
            />
          </div>
        ))}
      </div>

      <button
        className="patients-carousel__arrow"
        style={arrowStyle}
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
