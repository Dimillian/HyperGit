'use client'

import { useState, useEffect } from 'react'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { RecentFile, RecentFilesManager } from '@/lib/recentFiles'
import { File, Clock, X } from 'lucide-react'

interface RecentFilesProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile) => void
}

export default function RecentFiles({ onFileSelect }: RecentFilesProps) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])

  // Load recent files from localStorage
  useEffect(() => {
    const loadRecentFiles = () => {
      const files = RecentFilesManager.getRecentFiles()
      setRecentFiles(files)
    }

    loadRecentFiles()

    // Listen for storage changes (in case of updates from other tabs)
    const handleStorageChange = () => {
      loadRecentFiles()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Refresh the list (to be called from parent component)
  const refreshRecentFiles = () => {
    const files = RecentFilesManager.getRecentFiles()
    setRecentFiles(files)
  }

  // Remove a file from recent files
  const removeRecentFile = (repo: GitHubRepo, file: GitHubFile, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    RecentFilesManager.removeRecentFile(repo, file)
    refreshRecentFiles()
  }

  // Format relative time
  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Get file extension for styling
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  if (recentFiles.length === 0) {
    return null // Don't render anything if no recent files
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-[var(--neon-purple)]" />
        <h3 className="text-lg font-semibold text-[var(--dark-text)]">Recently Browsed Files</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentFiles.map((recentFile, index) => {
          const { file, repo, timestamp } = recentFile
          const language = getFileLanguage(file.name)
          const extension = getFileExtension(file.name)
          
          return (
            <div
              key={`${repo.full_name}-${file.path}-${timestamp}`}
              className="glass-effect p-4 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover cursor-pointer group relative"
              onClick={() => onFileSelect(repo, file)}
            >
              {/* Remove button */}
              <button
                onClick={(e) => removeRecentFile(repo, file, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-[var(--dark-bg-secondary)] text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)]"
              >
                <X className="w-3 h-3" />
              </button>
              
              <div className="flex items-start gap-3">
                <File className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--neon-purple)]" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--dark-text)] truncate">{file.name}</div>
                  <div className="text-xs text-[var(--dark-text-secondary)] truncate mt-1">
                    {repo.name}/{file.path}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--neon-purple)] bg-[var(--neon-purple)]/10 px-2 py-1 rounded">
                      {extension || 'file'}
                    </span>
                    <span className="text-xs text-[var(--dark-text-secondary)]">
                      {getRelativeTime(timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}