import { File, Folder, ChevronRight } from 'lucide-react'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'

interface FileDropdownProps {
  selectedRepo: GitHubRepo
  isCacheBuilding: boolean
  isSearching: boolean
  searchResults: GitHubFile[]
  afterAt: string
  selectedIndex: number
  currentPath: string
  beforeAt: string
  branch?: string
  setMode: (mode: 'repos' | 'files') => void
  setSelectedRepo: (repo: GitHubRepo | null) => void
  setQuery: (query: string) => void
  setCurrentPath: (path: string) => void
  navigateToFolder: (path: string) => void
  onFileSelect: (repo: GitHubRepo, file: GitHubFile, branch?: string) => void
  setIsDropdownOpen: (open: boolean) => void
}

export const FileDropdown = ({
  selectedRepo,
  isCacheBuilding,
  isSearching,
  searchResults,
  afterAt,
  selectedIndex,
  currentPath,
  beforeAt,
  branch,
  setMode,
  setSelectedRepo,
  setQuery,
  setCurrentPath,
  navigateToFolder,
  onFileSelect,
  setIsDropdownOpen
}: FileDropdownProps) => {
  const isRootFileView = !afterAt.split('/').slice(1).join('/')

  return (
    <>
      <div className="p-4 border-b border-[var(--dark-border)] text-sm font-medium text-[var(--neon-purple)]">
        <div className="flex items-center justify-between mb-2">
          <span>
            {selectedRepo?.name}
            {branch && branch !== selectedRepo?.default_branch && (
              <span className="text-xs text-[var(--dark-text-secondary)] ml-2">
                : {branch}
              </span>
            )}
            {' - '}
            {isCacheBuilding ? 'Loading files...' : isSearching ? 'Searching...' : 'Files'}
          </span>
          <button
            onClick={() => {
              setMode('repos')
              setSelectedRepo(null)
              setQuery(beforeAt)
              setCurrentPath('')
            }}
            className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] text-sm transition-colors duration-200 px-3 py-2 sm:px-2 sm:py-1 min-h-[44px] sm:min-h-0 flex items-center justify-center rounded hover:bg-[var(--neon-purple)]/10"
          >
            ← Back
          </button>
        </div>
        {currentPath && (
          <div className="flex items-center gap-1 text-xs text-[var(--dark-text-secondary)]">
            <button
              onClick={() => setCurrentPath('')}
              className="hover:text-[var(--neon-purple)] transition-colors p-1 min-w-[32px] min-h-[32px] sm:p-0 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded"
            >
              root
            </button>
            {currentPath.split('/').map((segment, index, arr) => {
              const path = arr.slice(0, index + 1).join('/')
              return (
                <span key={path} className="flex items-center">
                  <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3 mx-1" />
                  <button
                    onClick={() => setCurrentPath(path)}
                    className="hover:text-[var(--neon-purple)] transition-colors p-1 min-w-[32px] min-h-[32px] sm:p-0 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded"
                  >
                    {segment}
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>
      
      {isCacheBuilding ? (
        <div className="p-4 text-[var(--dark-text-secondary)] text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--neon-purple)]"></div>
            Building search index...
          </div>
          <p className="text-xs text-[var(--dark-text-secondary)]/70">
            This only happens once per repository
          </p>
        </div>
      ) : isSearching ? (
        <div className="p-4 text-[var(--dark-text-secondary)] text-center flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--neon-purple)]"></div>
          Searching...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-[var(--dark-text-secondary)] text-center">
          {afterAt.split('/').slice(1).join('/') ? 'No files found' : 'Start typing to search files'}
        </div>
      ) : (
        searchResults.map((file, index) => (
          <div
            key={file.path}
            data-dropdown-item
            className={`flex items-start gap-3 ${isRootFileView ? 'p-4 sm:p-3' : 'p-5 sm:p-4'} min-h-[56px] sm:min-h-0 cursor-pointer transition-all duration-200 ${
              index === selectedIndex 
                ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple-bright)] border-l-2 border-[var(--neon-purple)]' 
                : 'hover:bg-[var(--dark-bg-secondary)]/50 text-[var(--dark-text)] active:bg-[var(--dark-bg-secondary)]'
            }`}
            onClick={() => {
              if (file.type === 'dir') {
                navigateToFolder(file.path)
              } else {
                const currentBranch = branch || selectedRepo.default_branch
                onFileSelect(selectedRepo, file, currentBranch)
                setIsDropdownOpen(false)
              }
            }}
          >
            {file.type === 'dir' ? (
              <Folder className={`w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 ${isRootFileView ? 'mt-0' : 'mt-0.5'} ${
                index === selectedIndex ? 'text-[var(--neon-purple)]' : 'text-[var(--dark-text-secondary)]'
              }`} />
            ) : (
              <File className={`w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 ${isRootFileView ? 'mt-0' : 'mt-0.5'} ${
                index === selectedIndex ? 'text-[var(--neon-purple)]' : 'text-[var(--dark-text-secondary)]'
              }`} />
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium truncate text-left flex items-center gap-1">
                {file.name}
                {file.type === 'dir' && <ChevronRight className="w-3 h-3 opacity-50" />}
              </div>
              {!isRootFileView && (
                <div className={`text-sm truncate text-left ${
                  index === selectedIndex ? 'text-[var(--neon-purple)]/70' : 'text-[var(--dark-text-secondary)]'
                }`}>{file.path}</div>
              )}
            </div>
          </div>
        ))
      )}
    </>
  )
}