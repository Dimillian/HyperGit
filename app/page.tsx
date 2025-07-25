'use client'

import { useState } from 'react'
import { useGitHub } from '@/hooks/useGitHub'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { RecentFilesManager } from '@/lib/recentFiles'
import SearchBar from '@/components/SearchBar'
import FileViewer from '@/components/FileViewer'
import FileBrowser from '@/components/FileBrowser'
import AuthPrompt from '@/components/AuthPrompt'
import { RecentFiles, RecentSnippets } from '@/components/Card'
import LoadingScreen from '@/components/LoadingScreen'
import Footer from '@/components/Footer'
import { LogOut, GitBranch } from 'lucide-react'
import { TimePill, ShineCard, LanguageIcon } from '@/components/Card'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<{ repo: GitHubRepo; file: GitHubFile; branch?: string } | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepo; branch: string } | null>(null)
  const [recentFilesKey, setRecentFilesKey] = useState(0)
  const [recentSnippetsKey, setRecentSnippetsKey] = useState(0)
  const { isAuthenticated, repositories, clearToken, loading, isInitializing, loadingProgress } = useGitHub()

  const handleFileSelect = (repo: GitHubRepo, file: GitHubFile, branch?: string) => {
    // Track the file visit with branch information
    RecentFilesManager.addRecentFile(repo, file, branch || repo.default_branch)

    // Force re-render of recent files component
    setRecentFilesKey(prev => prev + 1)

    setSelectedFile({ repo, file, branch })
  }

  // Handle snippet save to refresh recent snippets
  const handleSnippetSaved = () => {
    setRecentSnippetsKey(prev => prev + 1)
  }

  const handleRepoSelect = () => {
    // This will be handled by the SearchBar component
  }

  const handleBrowseRepo = (repo: GitHubRepo, branch?: string) => {
    setSelectedRepo({ repo, branch: branch || repo.default_branch })
  }



  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen loadingProgress={loadingProgress} />
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <AuthPrompt />
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 text-[var(--neon-purple)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-full h-full">
                  {/* GitHub Icon - clean flat version */}
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                        fill="#a855f7"/>
                  {/* Lightning Bolt - clean and flat */}
                  <path d="M10 0l-3 7h2l-2 9 4-8h-2l3-8z"
                        fill="#fbbf24"/>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              onBrowseRepo={handleBrowseRepo}
              ref={(ref) => { if (ref) window.searchBarRef = ref }}
            />

            <div className="mt-12 space-y-12">
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
                    <ShineCard
                      key={repo.full_name}
                      className="glass-effect p-5 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover flex flex-col h-full active:scale-95"
                      onClick={() => {
                        if (window.searchBarRef?.selectRepositoryFromCard) {
                          window.searchBarRef.selectRepositoryFromCard(repo)
                        }
                      }}
                    >
                      <h3 className="font-medium text-[var(--dark-text)] truncate text-left">{repo.name}</h3>
                      <p className="text-sm text-[var(--dark-text-secondary)] mt-1 line-clamp-2 flex-1 text-left">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <LanguageIcon language={repo.language} size="lg" />
                          <span className="text-xs text-[var(--neon-purple)]">{repo.language || 'Unknown'}</span>
                        </div>
                        <TimePill timestamp={repo.pushed_at || repo.updated_at} />
                      </div>
                    </ShineCard>
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

              {/* Recent Snippets Section */}
              {isAuthenticated && (
                <div className="max-w-4xl mx-auto">
                  <RecentSnippets key={recentSnippetsKey} onFileSelect={handleFileSelect} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer
          repo={selectedFile.repo}
          file={selectedFile.file}
          branch={selectedFile.branch}
          onClose={() => setSelectedFile(null)}
          onSnippetSaved={handleSnippetSaved}
        />
      )}

      {/* File Browser Modal */}
      {selectedRepo && (
        <FileBrowser
          repo={selectedRepo.repo}
          branch={selectedRepo.branch}
          onClose={() => setSelectedRepo(null)}
          onSnippetSaved={handleSnippetSaved}
        />
      )}
    </div>
  )
}
