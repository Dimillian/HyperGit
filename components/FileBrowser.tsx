'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { fileTreeCache } from '@/lib/github/cache'
import { useGitHub } from '@/hooks/useGitHub'
import FileTree from './FileBrowser/FileTree'
import FilePreview from './FileBrowser/FilePreview'

interface FileBrowserProps {
  repo: GitHubRepo
  branch: string
  onClose: () => void
  onSnippetSaved?: () => void
}

export default function FileBrowser({ repo, branch, onClose, onSnippetSaved }: FileBrowserProps) {
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null)
  const [files, setFiles] = useState<GitHubFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { github } = useGitHub()

  useEffect(() => {
    const loadFiles = async () => {
      if (!github) return

      setLoading(true)
      setError(null)

      try {
        // Check cache first
        let cachedFiles = fileTreeCache.get(repo.full_name, branch)
        
        if (!cachedFiles) {
          // Try loading from localStorage
          cachedFiles = fileTreeCache.loadFromStorage(repo.full_name, branch)
          
          if (!cachedFiles) {
            // Fetch from API
            const [owner] = repo.full_name.split('/')
            const treeFiles = await github.getRepositoryTree(owner, repo.name, branch)
            
            // Cache the results
            fileTreeCache.set(repo.full_name, treeFiles, branch)
            cachedFiles = treeFiles
          } else {
            // Re-cache from storage
            fileTreeCache.set(repo.full_name, cachedFiles, branch)
          }
        }

        setFiles(cachedFiles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository files')
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [github, repo, branch])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="p-4 border-b border-[var(--dark-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[var(--dark-text)]">{repo.name}</h2>
            {branch !== repo.default_branch && (
              <span className="text-sm text-[var(--neon-purple)] bg-[var(--neon-purple)]/20 px-2 py-1 rounded">
                {branch}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-[var(--dark-border)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-[var(--dark-text-secondary)] flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--neon-purple)]"></div>
                  Loading file tree...
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-400">Error: {error}</div>
            ) : (
              <FileTree
                files={files}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            )}
          </div>

          {/* File Preview */}
          <div className="flex-1 overflow-hidden">
            {selectedFile ? (
              <FilePreview
                repo={repo}
                file={selectedFile}
                branch={branch}
                onSnippetSaved={onSnippetSaved}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--dark-text-secondary)]">
                Select a file to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}