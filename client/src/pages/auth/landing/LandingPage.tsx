import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { LogoIcon } from '../AuthLayout'
import { Button } from '@/components/ui/button'
import './LandingPage.css'

const images: string[] = [
  '/images/rehab1.jpg',
  '/images/rehab2.jpg',
  '/images/rehab3.jpg',
  '/images/rehab4.jpg',
  '/images/rehab5.jpg',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="landing">
      {images.map((src, i) => (
        <div
          key={src}
          className="landing__bg"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      <div className="landing__overlay" />

      <div className="landing__content">
        <div className="landing__logo-wrap">
          <LogoIcon size={88} />
        </div>
        <h1 className="landing__brand">Rehab360</h1>
        <h2 className="landing__headline">Your Recovery,<br />Fully Supported</h2>
        <p className="landing__tagline">
          Connecting patients, physiotherapists and trainers<br />in one platform
        </p>

        <div className="landing__actions">
          <Button className="btn-landing-primary" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button className="btn-landing-secondary" onClick={() => navigate('/role-select')}>
            Sign Up
          </Button>
        </div>
      </div>

      <div className="landing__dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`landing__dot${i === current ? ' landing__dot--active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>

      <p className="landing__trust">Trusted by 500+ rehabilitation professionals</p>
    </div>
  )
}
