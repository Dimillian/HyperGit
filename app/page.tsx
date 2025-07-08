'use client'

import { useState, useRef } from 'react'
import { useGitHub } from '@/hooks/useGitHub'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { RecentFilesManager } from '@/lib/recentFiles'
import SearchBar from '@/components/SearchBar'
import FileViewer from '@/components/FileViewer'
import AuthPrompt from '@/components/AuthPrompt'
import RecentFiles from '@/components/RecentFiles'
import LoadingScreen from '@/components/LoadingScreen'
import { LogOut, GitBranch, Clock, File } from 'lucide-react'
import * as SimpleIcons from 'simple-icons'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<{ repo: GitHubRepo; file: GitHubFile; branch?: string } | null>(null)
  const [recentFilesKey, setRecentFilesKey] = useState(0)
  const { isAuthenticated, repositories, clearToken, loading, isInitializing } = useGitHub()

  const handleFileSelect = (repo: GitHubRepo, file: GitHubFile, branch?: string) => {
    // Track the file visit
    RecentFilesManager.addRecentFile(repo, file)
    
    // Force re-render of recent files component
    setRecentFilesKey(prev => prev + 1)
    
    setSelectedFile({ repo, file, branch })
  }

  const handleRepoSelect = (repo: GitHubRepo) => {
    // This will be handled by the SearchBar component
  }

  // Get language icon for repository
  const getRepoLanguageIcon = (language: string | null) => {
    if (!language) {
      return <File className="w-3 h-3" style={{ color: '#888' }} />
    }

    const getIconPath = (iconName: string): string | null => {
      const icon = (SimpleIcons as any)[iconName]
      return icon?.path || null
    }

    const normalizedLang = language.toLowerCase()
    const iconMap: Record<string, { name: string; color: string }> = {
      'javascript': { name: 'siJavascript', color: '#F7DF1E' },
      'typescript': { name: 'siTypescript', color: '#3178C6' },
      'python': { name: 'siPython', color: '#3776AB' },
      'swift': { name: 'siSwift', color: '#F05138' },
      'kotlin': { name: 'siKotlin', color: '#7F52FF' },
      'java': { name: 'siOpenjdk', color: '#ED8B00' },
      'c++': { name: 'siCplusplus', color: '#00599C' },
      'c': { name: 'siC', color: '#A8B9CC' },
      'c#': { name: 'siCsharp', color: '#239120' },
      'ruby': { name: 'siRuby', color: '#CC342D' },
      'go': { name: 'siGo', color: '#00ADD8' },
      'rust': { name: 'siRust', color: '#000000' },
      'php': { name: 'siPhp', color: '#777BB4' },
      'html': { name: 'siHtml5', color: '#E34F26' },
      'css': { name: 'siCss3', color: '#1572B6' },
      'scss': { name: 'siSass', color: '#CC6699' },
      'vue': { name: 'siVuedotjs', color: '#4FC08D' },
      'svelte': { name: 'siSvelte', color: '#FF3E00' },
      'dart': { name: 'siDart', color: '#0175C2' },
      'shell': { name: 'siGnubash', color: '#4EAA25' },
      'dockerfile': { name: 'siDocker', color: '#2496ED' },
      'objective-c': { name: 'siApple', color: '#000000' },
      'scala': { name: 'siScala', color: '#DC322F' },
      'r': { name: 'siR', color: '#276DC3' },
      'lua': { name: 'siLua', color: '#2C2D72' },
      'perl': { name: 'siPerl', color: '#39457E' },
      'haskell': { name: 'siHaskell', color: '#5E5086' },
      'clojure': { name: 'siClojure', color: '#5881D8' },
      'elixir': { name: 'siElixir', color: '#4B275F' },
      'erlang': { name: 'siErlang', color: '#A90533' },
    }

    const iconInfo = iconMap[normalizedLang]
    if (!iconInfo) {
      return <File className="w-3 h-3" style={{ color: '#888' }} />
    }

    const iconPath = getIconPath(iconInfo.name)
    if (!iconPath) {
      return <File className="w-3 h-3" style={{ color: '#888' }} />
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

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen />
  }

  // Show login screen if not authenticated
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
              <div className="w-6 h-6 text-[var(--neon-purple)] flex items-center justify-center relative">
                <svg 
                  viewBox="0 0 16 16"
                  className="w-full h-full"
                >
                  {/* GitHub Icon - original size and position */}
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" 
                        fill="currentColor"/>
                  {/* Lightning Bolt - full height with glow */}
                  <path d="M10 0l-3 7h2l-2 9 4-8h-2l3-8z" 
                        fill="#fbbf24" 
                        stroke="#000" 
                        strokeWidth="0.2"
                        opacity="0.95"
                        filter="url(#lightning-glow)"/>
                  {/* Glow effect filter */}
                  <defs>
                    <filter id="lightning-glow">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
              </div>
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

            <SearchBar 
              onFileSelect={handleFileSelect} 
              onRepoSelect={handleRepoSelect}
              ref={(ref) => { if (ref) window.searchBarRef = ref }}
            />

            <div className="mt-12 space-y-12">
              <p className="text-[var(--dark-text-secondary)] mb-8">
                Quick tip: Type <code className="bg-[var(--dark-bg-tertiary)] text-[var(--neon-purple)] px-2 py-1 rounded text-sm border border-[var(--neon-purple)]/30">@repo-name/filename</code> to search
              </p>
              
              {/* Recent Repositories Section */}
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[var(--neon-purple)]" />
                  <h3 className="text-lg font-semibold text-[var(--dark-text)]">Recent Repositories</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  // Shimmer loading cards
                  Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="glass-effect p-5 rounded-xl border border-[var(--dark-border)] shimmer"
                    >
                      <div className="h-5 bg-gray-300/20 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300/20 rounded mb-1 w-3/4"></div>
                      <div className="h-4 bg-gray-300/20 rounded mb-3 w-1/2"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-gray-300/20 rounded w-16"></div>
                        <div className="h-3 bg-gray-300/20 rounded w-20"></div>
                      </div>
                    </div>
                  ))
                ) : repositories.length > 0 ? (
                  // Actual repository cards
                  repositories.slice(0, 6).map((repo) => (
                    <div
                      key={repo.full_name}
                      className="glass-effect p-5 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover cursor-pointer"
                      onClick={() => {
                        if (window.searchBarRef?.selectRepositoryFromCard) {
                          window.searchBarRef.selectRepositoryFromCard(repo)
                        }
                      }}
                    >
                      <h3 className="font-medium text-[var(--dark-text)] truncate">{repo.name}</h3>
                      <p className="text-sm text-[var(--dark-text-secondary)] mt-1 line-clamp-2">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          {getRepoLanguageIcon(repo.language)}
                          <span className="text-xs text-[var(--neon-purple)]">{repo.language || 'Unknown'}</span>
                        </div>
                        <span className="text-xs text-[var(--dark-text-secondary)]">
                          {new Date(repo.pushed_at || repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : null}
                </div>
              </div>

              {/* Recent Files Section */}
              {isAuthenticated && (
                <div className="max-w-4xl mx-auto">
                  <RecentFiles key={recentFilesKey} onFileSelect={handleFileSelect} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--dark-border)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-[var(--dark-text-secondary)]">
              Made with ❤️ by{' '}
              <a 
                href="https://dimillian.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
              >
                @Dimillian
              </a>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[var(--dark-text-secondary)]">
              <span>
                Powered by{' '}
                <a 
                  href="https://docs.github.com/en/rest" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
                >
                  GitHub API
                </a>
              </span>
              <span>•</span>
              <a 
                href="https://github.com/Dimillian/HyperGit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
              >
                View Source
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer
          repo={selectedFile.repo}
          file={selectedFile.file}
          branch={selectedFile.branch}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}