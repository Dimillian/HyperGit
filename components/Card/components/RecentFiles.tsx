'use client'

import { useState, useEffect } from 'react'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { RecentFile, RecentFilesManager } from '@/lib/recentFiles'
import { Clock, X } from 'lucide-react'
import { TimePill, ShineCard, LanguageIcon, CardActions, FilePathDisplay } from '../ui'

interface RecentFilesProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile, branch?: string) => void
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
  const removeRecentFile = (repo: GitHubRepo, file: GitHubFile, branch: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    RecentFilesManager.removeRecentFile(repo, file, branch)
    refreshRecentFiles()
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
          const { file, repo, branch, timestamp } = recentFile
          const language = getFileLanguage(file.name)
          const extension = getFileExtension(file.name)
          
          const actions = [
            {
              icon: <X className="w-3 h-3" />,
              onClick: (e: React.MouseEvent) => removeRecentFile(repo, file, branch, e),
              title: "Remove file"
            }
          ]
          
          return (
            <ShineCard
              key={`${repo.full_name}-${file.path}-${branch}-${timestamp}`}
              className="glass-effect p-4 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover group relative"
              onClick={() => onFileSelect(repo, file, branch)}
            >
              {/* Remove button */}
              <CardActions 
                actions={actions}
                className="absolute top-2 right-2"
              />
              
              <div className="text-left">
                <div className="font-medium text-[var(--dark-text)] truncate text-left">{file.name}</div>
                <FilePathDisplay 
                  repoName={repo.name}
                  filePath={file.path}
                  branch={branch}
                  defaultBranch={repo.default_branch}
                  className="mt-1 text-left"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[var(--neon-purple)] bg-[var(--neon-purple)]/10 rounded flex items-center gap-1">
                    <LanguageIcon filename={file.name} size="sm" />
                    <span>{extension || 'file'}</span>
                  </span>
                  <TimePill timestamp={timestamp} />
                </div>
              </div>
            </ShineCard>
          )
        })}
      </div>
    </div>
  )
}