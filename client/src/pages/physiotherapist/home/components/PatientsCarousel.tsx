import { useRef } from 'react'
import PatientCard from './PatientCard'
import type { Patient } from '@/types'
import './PatientsCarousel.css'

interface PatientsCarouselProps {
  patients: Patient[]
  onPatientClick: (patientId: string) => void
}

export default function PatientsCarousel({ patients, onPatientClick }: PatientsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  return (
    <div className="patients-carousel">
      {/* Left arrow */}
      <button
        className="patients-carousel__arrow"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Scrollable track */}
      <div className="patients-carousel__track" ref={trackRef}>
        {patients.map((patient) => (
          <div key={patient.id} className="patients-carousel__item">
            <PatientCard
              patient={patient}
              onClick={() => onPatientClick(patient.id)}
            />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        className="patients-carousel__arrow"
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
