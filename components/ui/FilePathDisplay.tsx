'use client'

interface FilePathDisplayProps {
  repoName: string
  filePath: string
  branch?: string
  defaultBranch?: string
  lineRange?: string
  className?: string
}

export function FilePathDisplay({ 
  repoName, 
  filePath, 
  branch, 
  defaultBranch, 
  lineRange, 
  className = '' 
}: FilePathDisplayProps) {
  const showBranch = branch && branch !== defaultBranch
  
  return (
    <div className={`text-xs text-[var(--dark-text-secondary)] truncate ${className}`}>
      {repoName}
      {showBranch && (
        <span className="text-[var(--neon-purple)] mx-1">:{branch}</span>
      )}
      /{filePath}
      {lineRange && (
        <span className="ml-1">{lineRange}</span>
      )}
    </div>
  )
}