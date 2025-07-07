'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { fileTreeCache } from '@/lib/github/cache'
import { Search } from 'lucide-react'
import { useGitHub } from '@/hooks/useGitHub'
import { useDropdownVisibility } from './SearchBar/hooks/useDropdownVisibility'
import { useKeyboardNavigation } from './SearchBar/hooks/useKeyboardNavigation'
import { getItemsForPath, parseQuery } from './SearchBar/utils/folderUtils'
import { RepositoryDropdown } from './SearchBar/components/RepositoryDropdown'
import { FileDropdown } from './SearchBar/components/FileDropdown'

interface SearchBarProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile) => void
  onRepoSelect?: (repo: GitHubRepo) => void
}

const SearchBar = forwardRef<{ selectRepositoryFromCard: (repo: GitHubRepo) => void; resetSearchBar: () => void }, SearchBarProps>(
  function SearchBar({ onFileSelect, onRepoSelect }, ref) {
  const [query, setQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mode, setMode] = useState<'repos' | 'files'>('repos')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [searchResults, setSearchResults] = useState<GitHubFile[]>([])
  const [currentPath, setCurrentPath] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isCacheBuilding, setIsCacheBuilding] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { github, repositories, isAuthenticated } = useGitHub()

  const { beforeAt, afterAt } = parseQuery(query)
  
  // Filter repositories based on query
  const filteredRepos = repositories.filter(repo => 
    afterAt === '' || repo.name.toLowerCase().includes(afterAt.toLowerCase())
  )
  
  // Use custom hooks
  const { inputRef, shouldShowDropdown } = useDropdownVisibility(
    query, 
    isAuthenticated, 
    mode, 
    setIsDropdownOpen
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

  // Use keyboard navigation hook
  useKeyboardNavigation({
    isDropdownOpen,
    mode,
    selectedIndex,
    setSelectedIndex,
    filteredRepos,
    searchResults,
    dropdownRef,
    currentPath,
    setCurrentPath,
    setIsDropdownOpen,
    setMode,
    setSelectedRepo,
    setQuery,
    beforeAt,
    selectRepository,
    navigateToFolder,
    onFileSelect,
    selectedRepo
  })

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

  // Handle dropdown visibility based on query content
  useEffect(() => {
    if (isAuthenticated && inputRef.current === document.activeElement) {
      const hasAtSymbol = query.includes('@')
      const isEmpty = query.trim() === ''
      
      // Show dropdown if:
      // 1. Query is empty (show repos)
      // 2. Query contains @ (show repos or files)
      // 3. We're in file mode (already selected a repo)
      const shouldShowDropdown = isEmpty || hasAtSymbol || mode === 'files'
      setIsDropdownOpen(shouldShowDropdown)
    }
  }, [query, isAuthenticated, mode])

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
              // Determine if dropdown should be shown based on current state
              const shouldShow = shouldShowDropdown(query, mode)
              setIsDropdownOpen(shouldShow)
              
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
            <RepositoryDropdown
              filteredRepos={filteredRepos}
              afterAt={afterAt}
              selectedIndex={selectedIndex}
              selectRepository={selectRepository}
            />
          ) : (
            <FileDropdown
              selectedRepo={selectedRepo!}
              isCacheBuilding={isCacheBuilding}
              isSearching={isSearching}
              searchResults={searchResults}
              afterAt={afterAt}
              selectedIndex={selectedIndex}
              currentPath={currentPath}
              beforeAt={beforeAt}
              setMode={setMode}
              setSelectedRepo={setSelectedRepo}
              setQuery={setQuery}
              setCurrentPath={setCurrentPath}
              navigateToFolder={navigateToFolder}
              onFileSelect={onFileSelect}
              setIsDropdownOpen={setIsDropdownOpen}
            />
          )}
        </div>
      )}
    </div>
  )
})

export default SearchBar