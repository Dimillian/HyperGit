'use client'

import { useState, useRef, useEffect } from 'react'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { Search, GitBranch, File, Folder } from 'lucide-react'
import { useGitHub } from '@/hooks/useGitHub'

interface SearchBarProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile) => void
}

export default function SearchBar({ onFileSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mode, setMode] = useState<'repos' | 'files'>('repos')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [searchResults, setSearchResults] = useState<GitHubFile[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { github, repositories, isAuthenticated } = useGitHub()

  // Parse the @ mention query
  const parseQuery = (input: string) => {
    const atIndex = input.lastIndexOf('@')
    if (atIndex === -1) return { beforeAt: input, afterAt: '' }
    
    return {
      beforeAt: input.substring(0, atIndex),
      afterAt: input.substring(atIndex + 1)
    }
  }

  const { beforeAt, afterAt } = parseQuery(query)
  const isInMention = query.includes('@')

  // Filter repositories based on query
  const filteredRepos = repositories.filter(repo => 
    afterAt === '' || repo.name.toLowerCase().includes(afterAt.toLowerCase())
  )

  // Handle repository selection
  const selectRepository = async (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setMode('files')
    setQuery(beforeAt + '@' + repo.name + '/')
    setSelectedIndex(0)
    setSearchResults([])
    inputRef.current?.focus()
  }

  // Handle file search when in file mode
  useEffect(() => {
    if (mode === 'files' && selectedRepo && github) {
      const pathQuery = afterAt.split('/').slice(1).join('/')
      
      if (pathQuery.length > 0) {
        setIsSearching(true)
        
        const searchTimeout = setTimeout(async () => {
          try {
            const repoInfo = { owner: selectedRepo.full_name.split('/')[0], repo: selectedRepo.name }
            const files = await github.searchRepositoryFiles(repoInfo.owner, repoInfo.repo, pathQuery)
            setSearchResults(files)
          } catch (error) {
            console.error('Search failed:', error)
            setSearchResults([])
          } finally {
            setIsSearching(false)
          }
        }, 300)

        return () => clearTimeout(searchTimeout)
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }
  }, [afterAt, mode, selectedRepo, github])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDropdownOpen) return

      const maxIndex = mode === 'repos' ? filteredRepos.length - 1 : searchResults.length - 1

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : maxIndex
            // Scroll to the selected item
            setTimeout(() => {
              const container = dropdownRef.current
              if (container) {
                const items = container.querySelectorAll('[data-dropdown-item]')
                const selectedElement = items[newIndex] as HTMLElement
                if (selectedElement) {
                  selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
              }
            }, 0)
            return newIndex
          })
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => {
            const newIndex = prev < maxIndex ? prev + 1 : 0
            // Scroll to the selected item
            setTimeout(() => {
              const container = dropdownRef.current
              if (container) {
                const items = container.querySelectorAll('[data-dropdown-item]')
                const selectedElement = items[newIndex] as HTMLElement
                if (selectedElement) {
                  selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
              }
            }, 0)
            return newIndex
          })
          break
        case 'Enter':
          e.preventDefault()
          if (mode === 'repos' && filteredRepos[selectedIndex]) {
            selectRepository(filteredRepos[selectedIndex])
          } else if (mode === 'files' && searchResults[selectedIndex]) {
            onFileSelect(selectedRepo!, searchResults[selectedIndex])
            setIsDropdownOpen(false)
          }
          break
        case 'Escape':
          setIsDropdownOpen(false)
          if (mode === 'files') {
            setMode('repos')
            setSelectedRepo(null)
            setQuery(beforeAt)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen, mode, selectedIndex, filteredRepos, searchResults, selectedRepo, beforeAt])

  // Reset selection when switching modes or query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [mode, afterAt])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--neon-purple)] w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => isAuthenticated && setIsDropdownOpen(true)}
          onBlur={(e) => {
            // Delay to allow clicking dropdown items
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) {
                setIsDropdownOpen(false)
              }
            }, 150)
          }}
          placeholder={isAuthenticated ? "Type @repo-name/file-path to search..." : "Please login with GitHub first"}
          disabled={!isAuthenticated}
          className="w-full pl-12 pr-6 py-5 text-lg rounded-2xl glass-effect text-[var(--dark-text)] placeholder-[var(--dark-text-secondary)] focus:outline-none focus:border-[var(--neon-purple)] focus:neon-glow transition-all duration-300 shiny-surface"
        />
      </div>

      {/* Dropdown */}
      {isDropdownOpen && isAuthenticated && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-3 w-full glass-effect border border-[var(--neon-purple)]/30 rounded-2xl max-h-80 overflow-y-auto z-50 backdrop-blur-xl"
        >
          {mode === 'repos' ? (
            <>
              <div className="p-4 border-b border-[var(--dark-border)] text-sm font-medium text-[var(--neon-purple)]">
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
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 ${
                      index === selectedIndex ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple-bright)] border-l-2 border-[var(--neon-purple)]' : 'hover:bg-[var(--dark-bg-secondary)]/50 text-[var(--dark-text)]'
                    }`}
                    onClick={() => selectRepository(repo)}
                  >
                    <GitBranch className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
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
          ) : (
            <>
              <div className="p-4 border-b border-[var(--dark-border)] text-sm font-medium text-[var(--neon-purple)] flex items-center justify-between">
                <span>{selectedRepo?.name} - {isSearching ? 'Searching...' : 'Files'}</span>
                <button
                  onClick={() => {
                    setMode('repos')
                    setSelectedRepo(null)
                    setQuery(beforeAt)
                  }}
                  className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] text-sm transition-colors duration-200 px-2 py-1 rounded hover:bg-[var(--neon-purple)]/10"
                >
                  ← Back
                </button>
              </div>
              {isSearching ? (
                <div className="p-4 text-[var(--dark-text-secondary)] text-center flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--neon-purple)]"></div>
                  Searching repository...
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
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 ${
                      index === selectedIndex ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple-bright)] border-l-2 border-[var(--neon-purple)]' : 'hover:bg-[var(--dark-bg-secondary)]/50 text-[var(--dark-text)]'
                    }`}
                    onClick={() => {
                      onFileSelect(selectedRepo!, file)
                      setIsDropdownOpen(false)
                    }}
                  >
                    <File className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      index === selectedIndex ? 'text-[var(--neon-purple)]' : 'text-[var(--dark-text-secondary)]'
                    }`} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium truncate text-left">{file.name}</div>
                      <div className={`text-sm truncate text-left ${
                        index === selectedIndex ? 'text-[var(--neon-purple)]/70' : 'text-[var(--dark-text-secondary)]'
                      }`}>{file.path}</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}