'use client'

import { useState, useEffect } from 'react'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { RecentFile, RecentFilesManager } from '@/lib/recentFiles'
import { File, Clock, X } from 'lucide-react'
import * as SimpleIcons from 'simple-icons'

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

  // Get language icon component
  const getLanguageIcon = (filename: string) => {
    const ext = getFileExtension(filename)
    
    const getIconPath = (iconName: string): string | null => {
      const icon = (SimpleIcons as any)[iconName]
      return icon?.path || null
    }

    const iconMap: Record<string, { name: string; color: string }> = {
      'js': { name: 'siJavascript', color: '#F7DF1E' },
      'jsx': { name: 'siReact', color: '#61DAFB' },
      'ts': { name: 'siTypescript', color: '#3178C6' },
      'tsx': { name: 'siReact', color: '#61DAFB' },
      'py': { name: 'siPython', color: '#3776AB' },
      'swift': { name: 'siSwift', color: '#F05138' },
      'kt': { name: 'siKotlin', color: '#7F52FF' },
      'java': { name: 'siOpenjdk', color: '#ED8B00' },
      'cpp': { name: 'siCplusplus', color: '#00599C' },
      'c': { name: 'siC', color: '#A8B9CC' },
      'cs': { name: 'siCsharp', color: '#239120' },
      'rb': { name: 'siRuby', color: '#CC342D' },
      'go': { name: 'siGo', color: '#00ADD8' },
      'rs': { name: 'siRust', color: '#000000' },
      'php': { name: 'siPhp', color: '#777BB4' },
      'html': { name: 'siHtml5', color: '#E34F26' },
      'css': { name: 'siCss3', color: '#1572B6' },
      'scss': { name: 'siSass', color: '#CC6699' },
      'vue': { name: 'siVuedotjs', color: '#4FC08D' },
      'svelte': { name: 'siSvelte', color: '#FF3E00' },
      'dart': { name: 'siDart', color: '#0175C2' },
      'dockerfile': { name: 'siDocker', color: '#2496ED' },
      'json': { name: 'siJson', color: '#000000' },
    }

    const iconInfo = iconMap[ext]
    if (!iconInfo) {
      return (
        <File className="w-3 h-3" style={{ color: '#888' }} />
      )
    }

    const iconPath = getIconPath(iconInfo.name)
    if (!iconPath) {
      return (
        <File className="w-3 h-3" style={{ color: '#888' }} />
      )
    }

    return (
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill={iconInfo.color}
      >
        <path d={iconPath} />
      </svg>
    )
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
          const languageIcon = getLanguageIcon(file.name)
          
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
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-[var(--dark-text)] truncate text-left">{file.name}</div>
                  <div className="text-xs text-[var(--dark-text-secondary)] truncate mt-1 text-left">
                    {repo.name}/{file.path}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--neon-purple)] bg-[var(--neon-purple)]/10 rounded flex items-center gap-1">
                      {languageIcon}
                      <span>{extension || 'file'}</span>
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