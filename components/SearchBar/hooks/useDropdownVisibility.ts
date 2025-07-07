import { useEffect, useRef } from 'react'

export const useDropdownVisibility = (
  query: string,
  isAuthenticated: boolean,
  mode: 'repos' | 'files',
  setIsDropdownOpen: (open: boolean) => void
) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Centralized logic for dropdown visibility
  const shouldShowDropdown = (query: string, mode: 'repos' | 'files') => {
    const hasAtSymbol = query.includes('@')
    const isEmpty = query.trim() === ''
    return isEmpty || hasAtSymbol || mode === 'files'
  }

  // Handle dropdown visibility based on query content
  useEffect(() => {
    if (isAuthenticated && inputRef.current === document.activeElement) {
      setIsDropdownOpen(shouldShowDropdown(query, mode))
    }
  }, [query, isAuthenticated, mode, setIsDropdownOpen])

  return {
    inputRef,
    shouldShowDropdown: (q: string, m: 'repos' | 'files') => shouldShowDropdown(q, m)
  }
}