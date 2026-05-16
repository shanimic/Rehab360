import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function ScrollToBottomButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function checkScroll() {
      const distanceFromBottom = document.body.scrollHeight - window.scrollY - window.innerHeight
      setVisible(distanceFromBottom > 150)
    }

    checkScroll()
    window.addEventListener('scroll', checkScroll, { passive: true })
    return () => window.removeEventListener('scroll', checkScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      className="ais-scroll-btn"
      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
      aria-label="Scroll to bottom"
    >
      <ChevronDown size={20} />
    </button>
  )
}
