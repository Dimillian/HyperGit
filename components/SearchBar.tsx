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
          setSelectedIndex(prev => prev > 0 ? prev - 1 : maxIndex)
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => prev < maxIndex ? prev + 1 : 0)
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
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
          className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none bg-white shadow-sm transition-all duration-200"
        />
      </div>

      {/* Dropdown */}
      {isDropdownOpen && isAuthenticated && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
        >
          {mode === 'repos' ? (
            <>
              <div className="p-3 border-b border-gray-100 text-sm font-medium text-gray-600">
                {afterAt ? `Repositories matching "${afterAt}"` : 'Your Repositories'}
              </div>
              {filteredRepos.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  {afterAt ? `No repositories match "${afterAt}"` : 'No repositories found'}
                </div>
              ) : (
                filteredRepos.map((repo, index) => (
                  <div
                    key={repo.full_name}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectRepository(repo)}
                  >
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{repo.name}</div>
                      {repo.description && (
                        <div className="text-sm text-gray-500 truncate">{repo.description}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              <div className="p-3 border-b border-gray-100 text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>{selectedRepo?.name} - {isSearching ? 'Searching...' : 'Files'}</span>
                <button
                  onClick={() => {
                    setMode('repos')
                    setSelectedRepo(null)
                    setQuery(beforeAt)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Back
                </button>
              </div>
              {isSearching ? (
                <div className="p-4 text-gray-500 text-center">Searching repository...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  {afterAt.split('/').slice(1).join('/') ? 'No files found' : 'Start typing to search files'}
                </div>
              ) : (
                searchResults.map((file, index) => (
                  <div
                    key={file.path}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      onFileSelect(selectedRepo!, file)
                      setIsDropdownOpen(false)
                    }}
                  >
                    <File className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">{file.path}</div>
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