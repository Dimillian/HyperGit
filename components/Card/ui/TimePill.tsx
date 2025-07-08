interface TimePillProps {
  timestamp: string | number
  className?: string
}

export function TimePill({ timestamp, className = "" }: TimePillProps) {
  const formatRelativeTime = (timestamp: string | number): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    // Calculate if it's been more than a month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    if (date < oneMonthAgo) {
      return date.toLocaleDateString()
    } else if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`
    } else {
      return 'just now'
    }
  }

  return (
    <span className={`text-xs text-[var(--dark-text-secondary)] bg-[var(--dark-bg-tertiary)] px-2 py-0.5 rounded ${className}`}>
      {formatRelativeTime(timestamp)}
    </span>
  )
}