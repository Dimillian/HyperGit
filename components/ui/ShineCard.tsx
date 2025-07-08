'use client'

import { useRef, useState } from 'react'

interface ShineCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ShineCard({ children, className = "", onClick }: ShineCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [shinePosition, setShinePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setShinePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden cursor-pointer group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        background: isHovered 
          ? `radial-gradient(600px circle at ${shinePosition.x}px ${shinePosition.y}px, rgba(168, 85, 247, 0.06), transparent 40%)`
          : undefined
      }}
    >
      {children}
      
      {/* Shine overlay that follows cursor */}
      {isHovered && (
        <div
          className="absolute pointer-events-none opacity-30 transition-opacity duration-300"
          style={{
            left: shinePosition.x - 100,
            top: shinePosition.y - 100,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 25%, transparent 50%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}
        />
      )}
    </div>
  )
}