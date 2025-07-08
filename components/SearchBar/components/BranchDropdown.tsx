import { GitBranch, Clock } from 'lucide-react'
import { GitHubRepo, GitHubBranch } from '@/lib/github/api'

interface BranchDropdownProps {
  selectedRepo: GitHubRepo
  isLoadingBranches: boolean
  filteredBranches: GitHubBranch[]
  selectedIndex: number
  beforeAt: string
  onBranchSelect: (branch: string) => void
}

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 30) {
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

export const BranchDropdown = ({
  selectedRepo,
  isLoadingBranches,
  filteredBranches,
  selectedIndex,
  beforeAt,
  onBranchSelect
}: BranchDropdownProps) => {
  return (
    <>
      <div className="p-4 border-b border-[var(--dark-border)] text-sm font-medium text-[var(--neon-purple)]">
        <div className="flex items-center justify-between">
          <span>
            {selectedRepo.name} - {isLoadingBranches ? 'Loading branches...' : 'Select Branch'}
          </span>
        </div>
      </div>
      
      {isLoadingBranches ? (
        <div className="p-4 text-[var(--dark-text-secondary)] text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--neon-purple)]"></div>
            Fetching branches...
          </div>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="p-4 text-[var(--dark-text-secondary)] text-center">
          No branches found
        </div>
      ) : (
        filteredBranches.map((branch, index) => (
          <div
            key={branch.name}
            data-dropdown-item
            className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 ${
              index === selectedIndex 
                ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple-bright)] border-l-2 border-[var(--neon-purple)]' 
                : 'hover:bg-[var(--dark-bg-secondary)]/50 text-[var(--dark-text)]'
            }`}
            onClick={() => onBranchSelect(branch.name)}
          >
            <GitBranch className={`w-4 h-4 flex-shrink-0 ${
              index === selectedIndex ? 'text-[var(--neon-purple)]' : 'text-[var(--dark-text-secondary)]'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate flex items-center gap-2">
                {branch.name}
                {branch.name === selectedRepo.default_branch && (
                  <span className="text-xs text-[var(--dark-text-secondary)] bg-[var(--dark-bg-tertiary)] px-2 py-0.5 rounded">
                    default
                  </span>
                )}
              </div>
              {branch.lastCommitDate && (
                <div className="flex items-center gap-1 text-xs text-[var(--dark-text-secondary)] mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Last commit {formatRelativeTime(branch.lastCommitDate)}</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </>
  )
}