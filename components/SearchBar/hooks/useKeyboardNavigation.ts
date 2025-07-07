import { useEffect } from 'react'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'

interface UseKeyboardNavigationProps {
  isDropdownOpen: boolean
  mode: 'repos' | 'files'
  selectedIndex: number
  setSelectedIndex: (index: number | ((prev: number) => number)) => void
  filteredRepos: GitHubRepo[]
  searchResults: GitHubFile[]
  dropdownRef: React.RefObject<HTMLDivElement | null>
  currentPath: string
  setCurrentPath: (path: string) => void
  setIsDropdownOpen: (open: boolean) => void
  setMode: (mode: 'repos' | 'files') => void
  setSelectedRepo: (repo: GitHubRepo | null) => void
  setQuery: (query: string) => void
  beforeAt: string
  selectRepository: (repo: GitHubRepo) => void
  navigateToFolder: (path: string) => void
  onFileSelect: (repo: GitHubRepo, file: GitHubFile) => void
  selectedRepo: GitHubRepo | null
}

export const useKeyboardNavigation = ({
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
}: UseKeyboardNavigationProps) => {
  
  const scrollToSelectedItem = (newIndex: number) => {
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
  }

  const handleArrowNavigation = (direction: 'up' | 'down') => {
    const maxIndex = mode === 'repos' ? filteredRepos.length - 1 : searchResults.length - 1
    
    setSelectedIndex((prev: number) => {
      let newIndex: number
      if (direction === 'up') {
        newIndex = prev > 0 ? prev - 1 : maxIndex
      } else {
        newIndex = prev < maxIndex ? prev + 1 : 0
      }
      scrollToSelectedItem(newIndex)
      return newIndex
    })
  }

  const handleEnter = () => {
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
  }

  const handleEscape = () => {
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
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDropdownOpen) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          handleArrowNavigation('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          handleArrowNavigation('down')
          break
        case 'Enter':
          e.preventDefault()
          handleEnter()
          break
        case 'Escape':
          handleEscape()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen, mode, selectedIndex, filteredRepos, searchResults, selectedRepo, beforeAt, currentPath])
}