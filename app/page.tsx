'use client'

import { useState } from 'react'
import { useGitHub } from '@/hooks/useGitHub'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import SearchBar from '@/components/SearchBar'
import FileViewer from '@/components/FileViewer'
import AuthPrompt from '@/components/AuthPrompt'
import { Github, LogOut } from 'lucide-react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<{ repo: GitHubRepo; file: GitHubFile } | null>(null)
  const { isAuthenticated, repositories, clearToken } = useGitHub()

  const handleFileSelect = (repo: GitHubRepo, file: GitHubFile) => {
    setSelectedFile({ repo, file })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthPrompt />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="shiny-surface border-b border-[var(--dark-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Github className="w-6 h-6 text-[var(--neon-purple)] neon-glow" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--dark-text)] via-[var(--neon-purple-bright)] to-[var(--dark-text)] bg-clip-text text-transparent">HyperGit</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--dark-text-secondary)]">
                {repositories.length} repositories
              </span>
              <button
                onClick={clearToken}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[var(--dark-text)] via-[var(--neon-purple-bright)] to-[var(--dark-text)] bg-clip-text text-transparent">
                Find any file, instantly
              </h2>
              <p className="text-xl text-[var(--dark-text-secondary)]">
                Search across all your GitHub repositories with lightning speed
              </p>
            </div>

            <SearchBar onFileSelect={handleFileSelect} />

            {repositories.length > 0 && (
              <div className="mt-12">
                <p className="text-[var(--dark-text-secondary)] mb-4">
                  Quick tip: Type <code className="bg-[var(--dark-bg-tertiary)] text-[var(--neon-purple)] px-2 py-1 rounded text-sm border border-[var(--neon-purple)]/30">@repo-name/filename</code> to search
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {repositories.slice(0, 6).map((repo) => (
                    <div
                      key={repo.full_name}
                      className="glass-effect p-5 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover"
                    >
                      <h3 className="font-medium text-[var(--dark-text)] truncate">{repo.name}</h3>
                      <p className="text-sm text-[var(--dark-text-secondary)] mt-1 line-clamp-2">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-[var(--neon-purple)]">{repo.language}</span>
                        <span className="text-xs text-[var(--dark-text-secondary)]">
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer
          repo={selectedFile.repo}
          file={selectedFile.file}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}