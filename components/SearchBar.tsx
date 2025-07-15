'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { GitHubRepo, GitHubFile, GitHubBranch } from '@/lib/github/api'
import { fileTreeCache } from '@/lib/github/cache'
import { Search, FolderOpen } from 'lucide-react'
import { useGitHub } from '@/hooks/useGitHub'
import { useDropdownVisibility } from './SearchBar/hooks/useDropdownVisibility'
import { useKeyboardNavigation } from './SearchBar/hooks/useKeyboardNavigation'
import { getItemsForPath, parseQuery } from './SearchBar/utils/folderUtils'
import { RepositoryDropdown } from './SearchBar/components/RepositoryDropdown'
import { FileDropdown } from './SearchBar/components/FileDropdown'
import { BranchDropdown } from './SearchBar/components/BranchDropdown'

interface SearchBarProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile, branch?: string) => void
  onRepoSelect?: (repo: GitHubRepo) => void
  onBrowseRepo?: (repo: GitHubRepo, branch?: string) => void
}

const SearchBar = forwardRef<{ selectRepositoryFromCard: (repo: GitHubRepo) => void; resetSearchBar: () => void; setSearchQuery: (query: string) => Promise<void>; inputRef: React.RefObject<HTMLInputElement | null> }, SearchBarProps>(
  function SearchBar({ onFileSelect, onRepoSelect, onBrowseRepo }, ref) {
  const [query, setQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mode, setMode] = useState<'repos' | 'files' | 'branches'>('repos')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [searchResults, setSearchResults] = useState<GitHubFile[]>([])
  const [currentPath, setCurrentPath] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isCacheBuilding, setIsCacheBuilding] = useState(false)
  const [branches, setBranches] = useState<GitHubBranch[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { github, repositories, isAuthenticated } = useGitHub()

  const { beforeAt, afterAt, repoName, branch, filePath } = parseQuery(query)
  
  // Determine if we should be in branch mode
  const colonIndex = afterAt.indexOf(':')
  const slashIndex = afterAt.indexOf('/')
  const shouldShowBranches = colonIndex > 0 && slashIndex === -1  // Only show branches if no slash after colon
  
  // Filter repositories based on query
  const filteredRepos = repositories.filter(repo => 
    afterAt === '' || repo.name.toLowerCase().includes(repoName.toLowerCase())
  )
  
  // Filter branches based on query
  const filteredBranches = branches.filter(branchObj =>
    !branch || branchObj.name.toLowerCase().includes(branch.toLowerCase())
  )
  
  // Use custom hooks
  const { inputRef, shouldShowDropdown } = useDropdownVisibility(
    query, 
    isAuthenticated, 
    mode, 
    setIsDropdownOpen
  )

  // Handle repository selection
  const selectRepository = async (repo: GitHubRepo, fromCard = false, targetBranch?: string) => {
    setSelectedRepo(repo)
    setMode('files')
    
    // Build query with or without branch
    const branchSuffix = targetBranch ? `:${targetBranch}` : ''
    setQuery(beforeAt + '@' + repo.name + branchSuffix + '/')
    setSelectedIndex(0)
    setCurrentPath('') // Reset to root when selecting a repo
    
    // If from card click, open dropdown immediately to show loading state
    if (fromCard) {
      setIsDropdownOpen(true)
      if (onRepoSelect) {
        onRepoSelect(repo)
      }
    }
    
    try {
      // Use the target branch or current branch from query, or default branch
      const branchToUse = targetBranch || branch || repo.default_branch
      
      // Check cache first (branch-specific)
      let files = fileTreeCache.get(repo.full_name, branchToUse)
      
      if (!files) {
        // If not in cache, try loading from localStorage
        files = fileTreeCache.loadFromStorage(repo.full_name, branchToUse)
        
        if (!files) {
          // If not in storage, fetch from API
          setIsCacheBuilding(true)
          const repoInfo = { owner: repo.full_name.split('/')[0], repo: repo.name }
          files = await github!.getRepositoryTree(repoInfo.owner, repoInfo.repo, branchToUse)
          
          // Cache the results (branch-specific)
          fileTreeCache.set(repo.full_name, files, branchToUse)
          setIsCacheBuilding(false)
        } else {
          // Re-cache from storage
          fileTreeCache.set(repo.full_name, files, branchToUse)
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
    const branchToUse = branch || selectedRepo!.default_branch
    const cachedFiles = fileTreeCache.get(selectedRepo!.full_name, branchToUse)
    if (cachedFiles) {
      const folderItems = getItemsForPath(cachedFiles, folderPath)
      setSearchResults(folderItems)
    }
  }

  // Handle branch selection
  const selectBranch = async (branchName: string) => {
    if (!selectedRepo) return
    
    // Update query with selected branch
    setQuery(beforeAt + '@' + selectedRepo.name + ':' + branchName + '/')
    setBranches([])
    setSelectedIndex(0)
    
    // Load files for the selected branch - this will switch to file mode
    await selectRepository(selectedRepo, false, branchName)
  }

  // Use keyboard navigation hook
  useKeyboardNavigation({
    isDropdownOpen,
    mode,
    selectedIndex,
    setSelectedIndex,
    filteredRepos,
    searchResults,
    filteredBranches,
    dropdownRef,
    currentPath,
    setCurrentPath,
    setIsDropdownOpen,
    setMode,
    setSelectedRepo,
    setQuery,
    beforeAt,
    branch,
    selectRepository,
    navigateToFolder,
    onFileSelect,
    selectedRepo,
    selectBranch
  })

  // Public method to set query programmatically
  const setSearchQuery = async (newQuery: string) => {
    setQuery(newQuery)
    
    // Parse the query to determine if we need to set up repository state
    const { afterAt, repoName, branch, filePath } = parseQuery(newQuery)
    
    // If the query contains a repository name, automatically set up the state
    if (afterAt && repoName) {
      const matchingRepo = repositories.find(repo => 
        repo.name.toLowerCase() === repoName.toLowerCase()
      )
      
      if (matchingRepo) {
        // Set up the repository state and load files
        await selectRepository(matchingRepo, false, branch)
        
        // If there's a file path that ends with '/', it's a folder path
        if (filePath && filePath.endsWith('/')) {
          const folderPath = filePath.slice(0, -1) // Remove trailing slash
          setCurrentPath(folderPath)
        }
      }
    }
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    selectRepositoryFromCard,
    resetSearchBar,
    setSearchQuery,
    inputRef
  }))

  // Handle file search when in file mode
  useEffect(() => {
    if (mode === 'files' && selectedRepo) {
      const branchToUse = branch || selectedRepo.default_branch
      
      if (filePath.length > 0) {
        // Use local search with shorter debounce
        const searchTimeout = setTimeout(() => {
          setIsSearching(true)
          
          try {
            // Search in cached files (branch-specific)
            const results = fileTreeCache.searchFiles(selectedRepo.full_name, filePath, branchToUse)
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
        const cachedFiles = fileTreeCache.get(selectedRepo.full_name, branchToUse)
        if (cachedFiles) {
          const pathItems = getItemsForPath(cachedFiles, currentPath)
          setSearchResults(pathItems)
        }
        setIsSearching(false)
      }
    }
  }, [filePath, mode, selectedRepo, currentPath, branch])


  // Reset selection when switching modes or query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [mode, repoName, branch, filePath])

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
      // 2. Query contains @ (show repos or files or branches)
      // 3. We're in file mode (already selected a repo)
      // 4. We're in branch mode (selecting a branch)
      const shouldShowDropdown = isEmpty || hasAtSymbol || mode === 'files' || mode === 'branches'
      setIsDropdownOpen(shouldShowDropdown)
    }
  }, [query, isAuthenticated, mode, inputRef])

  // Detect when to show branch autocomplete
  useEffect(() => {
    if (shouldShowBranches) {
      // User typed : after repo name
      const repoNameFromQuery = afterAt.substring(0, colonIndex)
      
      // Find the matching repository
      const matchingRepo = repositories.find(r => 
        r.name.toLowerCase() === repoNameFromQuery.toLowerCase()
      )
      
      if (matchingRepo) {
        if (selectedRepo?.name !== matchingRepo.name) {
          setSelectedRepo(matchingRepo)
          setBranches([]) // Clear branches when repo changes
        }
        
        if (mode !== 'branches') {
          setMode('branches')
        }
        
        // Fetch branches for this repository if not already loaded
        if (branches.length === 0 && !isLoadingBranches) {
          const fetchBranches = async () => {
            setIsLoadingBranches(true)
            try {
              const repoInfo = { owner: matchingRepo.full_name.split('/')[0], repo: matchingRepo.name }
              const repoBranches = await github!.getRepositoryBranches(repoInfo.owner, repoInfo.repo)
              setBranches(repoBranches)
            } catch (error) {
              console.error('Failed to fetch branches:', error)
              setBranches([])
            } finally {
              setIsLoadingBranches(false)
            }
          }
          
          fetchBranches()
        }
      }
    } else if (mode === 'branches' && !shouldShowBranches) {
      // User removed the colon or added slash, check what to do
      if (slashIndex > colonIndex && colonIndex > 0) {
        // User added slash after branch selection, should be in file mode now
        // The selectRepository call from selectBranch should have handled this
      } else {
        // User removed the colon, go back to repo mode
        setMode('repos')
        setBranches([])
      }
    }
  }, [shouldShowBranches, afterAt, repositories, github, mode, selectedRepo, branches.length, isLoadingBranches, colonIndex, slashIndex])

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
                const branchToUse = branch || selectedRepo.default_branch
                const cachedFiles = fileTreeCache.get(selectedRepo.full_name, branchToUse)
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
          placeholder={isAuthenticated ? "Type @repo-name or @repo-name:branch/file-path to search..." : "Please login with GitHub first"}
          disabled={!isAuthenticated}
          className={`w-full pl-12 ${selectedRepo ? 'pr-16' : 'pr-6'} py-5 text-lg rounded-2xl glass-effect text-[var(--dark-text)] placeholder-[var(--dark-text-secondary)] focus:outline-none focus:border-[var(--neon-purple)] focus:neon-glow transition-all duration-300 shiny-surface`}
        />
        {selectedRepo && onBrowseRepo && (
          <button
            onClick={() => onBrowseRepo(selectedRepo, branch || selectedRepo.default_branch)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--neon-purple)]/10"
            title="Browse repository files"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && isAuthenticated && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-3 w-full glass-effect border border-[var(--neon-purple)]/30 rounded-2xl max-h-96 sm:max-h-80 overflow-y-auto z-50 backdrop-blur-xl"
        >
          {mode === 'branches' || (mode === 'repos' && shouldShowBranches) ? (
            selectedRepo ? (
              <BranchDropdown
                selectedRepo={selectedRepo}
                isLoadingBranches={isLoadingBranches}
                filteredBranches={filteredBranches}
                selectedIndex={selectedIndex}
                onBranchSelect={selectBranch}
              />
            ) : (
              <div className="p-4 text-[var(--dark-text-secondary)] text-center">
                No matching repository found
              </div>
            )
          ) : mode === 'repos' ? (
            <RepositoryDropdown
              filteredRepos={filteredRepos}
              afterAt={repoName}
              selectedIndex={selectedIndex}
              selectRepository={selectRepository}
            />
          ) : (
            <FileDropdown
              selectedRepo={selectedRepo!}
              isCacheBuilding={isCacheBuilding}
              isSearching={isSearching}
              searchResults={searchResults}
              afterAt={filePath}
              selectedIndex={selectedIndex}
              currentPath={currentPath}
              beforeAt={beforeAt}
              branch={branch}
              setMode={setMode}
              setSelectedRepo={setSelectedRepo}
              setQuery={setQuery}
              setCurrentPath={setCurrentPath}
              navigateToFolder={navigateToFolder}
              onFileSelect={onFileSelect}
            />
          )}
        </div>
      )}
    </div>
  )
})

export default SearchBar