import { GitBranch } from 'lucide-react'
import { GitHubRepo } from '@/lib/github/api'

interface RepositoryDropdownProps {
  filteredRepos: GitHubRepo[]
  afterAt: string
  selectedIndex: number
  selectRepository: (repo: GitHubRepo) => void
}

export const RepositoryDropdown = ({
  filteredRepos,
  afterAt,
  selectedIndex,
  selectRepository
}: RepositoryDropdownProps) => {
  return (
    <>
      <div className="p-4 sm:p-4 border-b border-[var(--dark-border)] text-sm sm:text-sm font-medium text-[var(--neon-purple)]">
        {afterAt ? `Repositories matching "${afterAt}"` : 'Your Repositories'}
      </div>
      {filteredRepos.length === 0 ? (
        <div className="p-4 text-[var(--dark-text-secondary)] text-center">
          {afterAt ? `No repositories match "${afterAt}"` : 'No repositories found'}
        </div>
      ) : (
        filteredRepos.map((repo, index) => (
          <div
            key={repo.full_name}
            data-dropdown-item
            className={`flex items-start gap-3 p-5 sm:p-4 min-h-[56px] sm:min-h-0 cursor-pointer transition-all duration-200 ${
              index === selectedIndex 
                ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple-bright)] border-l-2 border-[var(--neon-purple)]' 
                : 'hover:bg-[var(--dark-bg-secondary)]/50 text-[var(--dark-text)] active:bg-[var(--dark-bg-secondary)]'
            }`}
            onClick={() => selectRepository(repo)}
          >
            <GitBranch className={`w-6 h-6 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
              index === selectedIndex ? 'text-[var(--neon-purple)]' : 'text-[var(--dark-text-secondary)]'
            }`} />
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium truncate text-left">{repo.name}</div>
              {repo.description && (
                <div className={`text-sm truncate text-left ${
                  index === selectedIndex ? 'text-[var(--neon-purple)]/70' : 'text-[var(--dark-text-secondary)]'
                }`}>{repo.description}</div>
              )}
            </div>
          </div>
        ))
      )}
    </>
  )
}