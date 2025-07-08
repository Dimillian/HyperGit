'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { RecentSnippet, RecentSnippetsManager } from '@/lib/recentSnippets'
import { Code, X, Copy, ExternalLink, CheckCircle, Eye } from 'lucide-react'
import SnippetViewer from './SnippetViewer'
import { TimePill } from './ui/TimePill'
import { ShineCard } from './ui/ShineCard'
import { LanguageIcon } from './ui/LanguageIcon'
import { CardActions } from './ui/CardActions'
import { FilePathDisplay } from './ui/FilePathDisplay'

interface RecentSnippetsProps {
  onFileSelect: (repo: GitHubRepo, file: GitHubFile, branch?: string) => void
}

export default function RecentSnippets({ onFileSelect }: RecentSnippetsProps) {
  const [recentSnippets, setRecentSnippets] = useState<RecentSnippet[]>([])
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [selectedSnippet, setSelectedSnippet] = useState<RecentSnippet | null>(null)

  // Load recent snippets from localStorage
  useEffect(() => {
    const loadRecentSnippets = () => {
      const snippets = RecentSnippetsManager.getRecentSnippets()
      setRecentSnippets(snippets)
    }

    loadRecentSnippets()

    // Listen for storage changes (in case of updates from other tabs)
    const handleStorageChange = () => {
      loadRecentSnippets()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Refresh the list (to be called from parent component)
  const refreshRecentSnippets = () => {
    const snippets = RecentSnippetsManager.getRecentSnippets()
    setRecentSnippets(snippets)
  }

  // Remove a snippet from recent snippets
  const removeRecentSnippet = (snippetId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    RecentSnippetsManager.removeRecentSnippet(snippetId)
    refreshRecentSnippets()
  }

  // Copy snippet to clipboard
  const copySnippet = async (snippet: RecentSnippet, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopiedSnippet(snippet.id)
      setTimeout(() => setCopiedSnippet(null), 2000)
    } catch (err) {
      console.error('Failed to copy snippet:', err)
    }
  }



  // Truncate code for preview
  const getCodePreview = (code: string, maxLines: number = 3): string => {
    const lines = code.split('\n')
    if (lines.length <= maxLines) return code
    return lines.slice(0, maxLines).join('\n') + '\n...'
  }

  if (recentSnippets.length === 0) {
    return null // Don't render anything if no recent snippets
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Code className="w-5 h-5 text-[var(--neon-purple)]" />
        <h3 className="text-lg font-semibold text-[var(--dark-text)]">Recent Code Snippets</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentSnippets.map((snippet) => {
          const lineRange = snippet.selectedLines.start === snippet.selectedLines.end 
            ? `L${snippet.selectedLines.start}` 
            : `L${snippet.selectedLines.start}-${snippet.selectedLines.end}`

          const actions = [
            {
              icon: <Eye className="w-4 h-4" />,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                onFileSelect(snippet.repo, snippet.file, snippet.branch)
              },
              title: "View full file"
            },
            {
              icon: copiedSnippet === snippet.id ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              ),
              onClick: (e: React.MouseEvent) => copySnippet(snippet, e),
              title: "Copy snippet"
            },
            {
              icon: <ExternalLink className="w-4 h-4" />,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                window.open(`https://github.com/${snippet.repo.full_name}/blob/${snippet.branch}/${snippet.file.path}#L${snippet.selectedLines.start}-L${snippet.selectedLines.end}`, '_blank')
              },
              title: "View on GitHub"
            },
            {
              icon: <X className="w-4 h-4" />,
              onClick: (e: React.MouseEvent) => removeRecentSnippet(snippet.id, e),
              title: "Remove snippet"
            }
          ]
          
          return (
            <ShineCard
              key={snippet.id}
              className="glass-effect p-4 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover group relative flex flex-col h-full active:scale-95"
              onClick={() => setSelectedSnippet(snippet)}
            >
              {/* Header with actions */}
              <div className="relative mb-3">
                {/* Title and subtitle - full width when buttons are hidden */}
                <div className="text-left sm:group-hover:pr-40 transition-all duration-200">
                  <div className="font-medium text-[var(--dark-text)] truncate text-sm text-left">
                    {snippet.title}
                  </div>
                  <FilePathDisplay 
                    repoName={snippet.repo.name}
                    filePath={snippet.file.path}
                    branch={snippet.branch}
                    defaultBranch={snippet.repo.default_branch}
                    lineRange={lineRange}
                    className="mt-1 text-left"
                  />
                </div>
                
                {/* Action buttons */}
                <CardActions 
                  actions={actions}
                  className="sm:absolute sm:top-0 sm:right-0 mt-2 sm:mt-0"
                  alwaysVisible={true}
                />
              </div>

              {/* Code preview */}
              <div className="flex-1 mb-3">
                <div className="rounded border border-[var(--dark-border)] overflow-hidden">
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={oneDark}
                    showLineNumbers
                    startingLineNumber={snippet.selectedLines.start}
                    wrapLines={false}
                    customStyle={{
                      margin: 0,
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                    }}
                  >
                    {getCodePreview(snippet.code, 4)}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <LanguageIcon language={snippet.language} size="md" />
                  <span className="text-[var(--neon-purple)]">{snippet.language}</span>
                </div>
                <TimePill timestamp={snippet.timestamp} />
              </div>
            </ShineCard>
          )
        })}
      </div>

      {/* Snippet Viewer Modal */}
      {selectedSnippet && (
        <SnippetViewer
          snippet={selectedSnippet}
          onClose={() => setSelectedSnippet(null)}
        />
      )}
    </div>
  )
}