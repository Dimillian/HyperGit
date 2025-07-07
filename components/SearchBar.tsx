'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { fileTreeCache } from '@/lib/github/cache'
import { Search, GitBranch, File, Folder, ChevronRight } from 'lucide-react'
import { useGitHub } from '@/hooks/useGitHub'

interface SearchBarProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile) => void
  onRepoSelect?: (repo: GitHubRepo) => void
}

const SearchBar = forwardRef<{ selectRepositoryFromCard: (repo: GitHubRepo) => void }, SearchBarProps>(
  function SearchBar({ onFileSelect, onRepoSelect }, ref) {
  const [query, setQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mode, setMode] = useState<'repos' | 'files'>('repos')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [searchResults, setSearchResults] = useState<GitHubFile[]>([])
  const [currentPath, setCurrentPath] = useState<string>('') // Track current folder path
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isCacheBuilding, setIsCacheBuilding] = useState(false)
  
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
  
  // Helper function to get files and folders for a specific path
  const getItemsForPath = (allFiles: GitHubFile[], path: string): GitHubFile[] => {
    const folders = new Set<string>()
    const items: GitHubFile[] = []
    
    allFiles.forEach(file => {
      // Skip if not in current path
      if (path && !file.path.startsWith(path + '/')) return
      if (!path && file.path.includes('/') && !file.path.startsWith('/')) {
        // Root level - check for folders
        const firstSlash = file.path.indexOf('/')
        if (firstSlash > 0) {
          const folderName = file.path.substring(0, firstSlash)
          if (!folders.has(folderName)) {
            folders.add(folderName)
            items.push({
              name: folderName,
              path: folderName,
              type: 'dir' as const,
              sha: '',
              size: 0
            })
          }
        }
      } else {
        // Deeper level
        const relativePath = path ? file.path.substring(path.length + 1) : file.path
        const firstSlash = relativePath.indexOf('/')
        
        if (firstSlash === -1) {
          // It's a file in current directory
          items.push(file)
        } else if (firstSlash > 0) {
          // It's a folder
          const folderName = relativePath.substring(0, firstSlash)
          const fullFolderPath = path ? `${path}/${folderName}` : folderName
          if (!folders.has(fullFolderPath)) {
            folders.add(fullFolderPath)
            items.push({
              name: folderName,
              path: fullFolderPath,
              type: 'dir' as const,
              sha: '',
              size: 0
            })
          }
        }
      }
    })
    
    // Sort folders first, then files
    return items.sort((a, b) => {
      if (a.type === 'dir' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'dir') return 1
      return a.name.localeCompare(b.name)
    })
  }

  // Filter repositories based on query
  const filteredRepos = repositories.filter(repo => 
    afterAt === '' || repo.name.toLowerCase().includes(afterAt.toLowerCase())
  )

  // Handle repository selection
  const selectRepository = async (repo: GitHubRepo, fromCard = false) => {
    setSelectedRepo(repo)
    setMode('files')
    setQuery(beforeAt + '@' + repo.name + '/')
    setSelectedIndex(0)
    setCurrentPath('') // Reset to root when selecting a repo
    
    try {
      // Check cache first
      let files = fileTreeCache.get(repo.full_name)
      
      if (!files) {
        // If not in cache, try loading from localStorage
        files = fileTreeCache.loadFromStorage(repo.full_name)
        
        if (!files) {
          // If not in storage, fetch from API
          setIsCacheBuilding(true)
          const repoInfo = { owner: repo.full_name.split('/')[0], repo: repo.name }
          files = await github!.getRepositoryTree(repoInfo.owner, repoInfo.repo)
          
          // Cache the results
          fileTreeCache.set(repo.full_name, files)
          setIsCacheBuilding(false)
        } else {
          // Re-cache from storage
          fileTreeCache.set(repo.full_name, files)
        }
      }
      
      // Show root files and folders
      const rootItems = getItemsForPath(files, '')
      setSearchResults(rootItems)
    } catch (error) {
      console.error('Failed to load repository tree:', error)
      setIsCacheBuilding(false)
      // Fallback to old method
      try {
        const repoInfo = { owner: repo.full_name.split('/')[0], repo: repo.name }
        const files = await github!.getRepositoryContents(repoInfo.owner, repoInfo.repo, '')
        setSearchResults(files)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setSearchResults([])
      }
    }
    
    // If from card click, also trigger the callback and open dropdown
    if (fromCard && onRepoSelect) {
      onRepoSelect(repo)
      setIsDropdownOpen(true)
    }
    
    inputRef.current?.focus()
  }

  // Public method to select repository from external component
  const selectRepositoryFromCard = (repo: GitHubRepo) => {
    selectRepository(repo, true)
  }

  // Public method to reset search bar
  const resetSearchBar = () => {
    setQuery('')
    setMode('repos')
    setSelectedRepo(null)
    setSearchResults([])
    setSelectedIndex(0)
    setCurrentPath('')
    setIsDropdownOpen(false)
  }

  // Handle folder navigation
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath)
    setSelectedIndex(0)
    
    // Update search results to show contents of the folder
    const cachedFiles = fileTreeCache.get(selectedRepo!.full_name)
    if (cachedFiles) {
      const folderItems = getItemsForPath(cachedFiles, folderPath)
      setSearchResults(folderItems)
    }
  }
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    selectRepositoryFromCard,
    resetSearchBar
  }))

  // Handle file search when in file mode
  useEffect(() => {
    if (mode === 'files' && selectedRepo) {
      const pathQuery = afterAt.split('/').slice(1).join('/')
      
      if (pathQuery.length > 0) {
        // Use local search with shorter debounce
        const searchTimeout = setTimeout(() => {
          setIsSearching(true)
          
          try {
            // Search in cached files
            const results = fileTreeCache.searchFiles(selectedRepo.full_name, pathQuery)
            setSearchResults(results)
          } catch (error) {
            console.error('Search failed:', error)
            setSearchResults([])
          } finally {
            setIsSearching(false)
          }
        }, 100) // Reduced from 300ms to 100ms

        return () => clearTimeout(searchTimeout)
      } else {
        // Show items for current path when no search query
        const cachedFiles = fileTreeCache.get(selectedRepo.full_name)
        if (cachedFiles) {
          const pathItems = getItemsForPath(cachedFiles, currentPath)
          setSearchResults(pathItems)
        }
        setIsSearching(false)
      }
    }
  }, [afterAt, mode, selectedRepo, currentPath])

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
            const selectedItem = searchResults[selectedIndex]
            if (selectedItem.type === 'dir') {
              navigateToFolder(selectedItem.path)
            } else {
              onFileSelect(selectedRepo!, selectedItem)
              setIsDropdownOpen(false)
            }
          }
          break
        case 'Escape':
          if (mode === 'files' && currentPath) {
            // Go back one folder level
            const lastSlash = currentPath.lastIndexOf('/')
            setCurrentPath(lastSlash > 0 ? currentPath.substring(0, lastSlash) : '')
          } else {
            setIsDropdownOpen(false)
            if (mode === 'files') {
              setMode('repos')
              setSelectedRepo(null)
              setQuery(beforeAt)
              setCurrentPath('')
            }
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

  // Reset state when search bar is emptied
  useEffect(() => {
    if (query.trim() === '') {
      setMode('repos')
      setSelectedRepo(null)
      setSearchResults([])
      setSelectedIndex(0)
      setCurrentPath('')
      setIsDropdownOpen(false)
    }
  }, [query])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--neon-purple)] w-5 h-5 z-10 drop-shadow-lg" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (isAuthenticated) {
              setIsDropdownOpen(true)
              // If we're in file mode but have no search results, show the folder contents
              if (mode === 'files' && selectedRepo && searchResults.length === 0) {
                const cachedFiles = fileTreeCache.get(selectedRepo.full_name)
                if (cachedFiles) {
                  const pathItems = getItemsForPath(cachedFiles, currentPath)
                  setSearchResults(pathItems)
                }
              }
            }
          }}
          onBlur={() => {
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
              <div className="p-4 border-b border-[var(--dark-border)] text-sm font-medium text-[var(--neon-purple)]">
                <div className="flex items-center justify-between mb-2">
                  <span>{selectedRepo?.name} - {isCacheBuilding ? 'Loading files...' : isSearching ? 'Searching...' : 'Files'}</span>
                  <button
                    onClick={() => {
                      setMode('repos')
                      setSelectedRepo(null)
                      setQuery(beforeAt)
                      setCurrentPath('')
                    }}
                    className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] text-sm transition-colors duration-200 px-2 py-1 rounded hover:bg-[var(--neon-purple)]/10"
                  >
                    ← Back
                  </button>
                </div>
                {currentPath && (
                  <div className="flex items-center gap-1 text-xs text-[var(--dark-text-secondary)]">
                    <button
                      onClick={() => setCurrentPath('')}
                      className="hover:text-[var(--neon-purple)] transition-colors"
                    >
                      root
                    </button>
                    {currentPath.split('/').map((segment, index, arr) => {
                      const path = arr.slice(0, index + 1).join('/')
                      return (
                        <span key={path} className="flex items-center">
                          <ChevronRight className="w-3 h-3 mx-1" />
                          <button
                            onClick={() => setCurrentPath(path)}
                            className="hover:text-[var(--neon-purple)] transition-colors"
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
                searchResults.map((file, index) => {
                  const isRootFileView = !afterAt.split('/').slice(1).join('/')
                  return (
                    <div
                      key={file.path}
                      data-dropdown-item
                      className={`flex items-start gap-3 ${isRootFileView ? 'p-3' : 'p-4'} cursor-pointer transition-all duration-200 ${
                        index === selectedIndex ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple-bright)] border-l-2 border-[var(--neon-purple)]' : 'hover:bg-[var(--dark-bg-secondary)]/50 text-[var(--dark-text)]'
                      }`}
                      onClick={() => {
                        if (file.type === 'dir') {
                          navigateToFolder(file.path)
                        } else {
                          onFileSelect(selectedRepo!, file)
                          setIsDropdownOpen(false)
                        }
                      }}
                    >
                      {file.type === 'dir' ? (
                        <Folder className={`w-4 h-4 flex-shrink-0 ${isRootFileView ? 'mt-0' : 'mt-0.5'} ${
                          index === selectedIndex ? 'text-[var(--neon-purple)]' : 'text-[var(--dark-text-secondary)]'
                        }`} />
                      ) : (
                        <File className={`w-4 h-4 flex-shrink-0 ${isRootFileView ? 'mt-0' : 'mt-0.5'} ${
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
                  )
                })
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
})

export default SearchBar