'use client'

import { ReactNode } from 'react'

interface CardAction {
  icon: ReactNode
  onClick: (e: React.MouseEvent) => void
  title: string
  className?: string
}

interface CardActionsProps {
  actions: CardAction[]
  className?: string
  alwaysVisible?: boolean // For mobile - show actions always instead of on hover
}

export function CardActions({ actions, className = '', alwaysVisible = false }: CardActionsProps) {
  const visibilityClasses = alwaysVisible 
    ? 'opacity-100' 
    : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'

  return (
    <div className={`flex items-center gap-1 ${visibilityClasses} transition-opacity duration-200 ${className}`}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-[var(--dark-bg-secondary)] text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] transition-colors duration-200 ${action.className || ''}`}
          title={action.title}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}