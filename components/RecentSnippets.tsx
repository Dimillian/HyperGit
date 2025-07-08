'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { RecentSnippet, RecentSnippetsManager } from '@/lib/recentSnippets'
import { Code, X, Copy, ExternalLink, CheckCircle, Eye } from 'lucide-react'
import SnippetViewer from './SnippetViewer'
import * as SimpleIcons from 'simple-icons'
import { TimePill } from './ui/TimePill'

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


  // Get language icon component
  const getLanguageIcon = (language: string) => {
    const getIconPath = (iconName: string): string | null => {
      const icon = (SimpleIcons as any)[iconName]
      return icon?.path || null
    }

    const iconMap: Record<string, { name: string; color: string }> = {
      'javascript': { name: 'siJavascript', color: '#F7DF1E' },
      'typescript': { name: 'siTypescript', color: '#3178C6' },
      'jsx': { name: 'siReact', color: '#61DAFB' },
      'tsx': { name: 'siReact', color: '#61DAFB' },
      'python': { name: 'siPython', color: '#3776AB' },
      'swift': { name: 'siSwift', color: '#F05138' },
      'kotlin': { name: 'siKotlin', color: '#7F52FF' },
      'java': { name: 'siOpenjdk', color: '#ED8B00' },
      'cpp': { name: 'siCplusplus', color: '#00599C' },
      'c': { name: 'siC', color: '#A8B9CC' },
      'csharp': { name: 'siCsharp', color: '#239120' },
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
      'dockerfile': { name: 'siDocker', color: '#2496ED' },
      'json': { name: 'siJson', color: '#000000' },
      'yaml': { name: 'siYaml', color: '#CB171E' },
      'markdown': { name: 'siMarkdown', color: '#000000' },
    }

    const iconInfo = iconMap[language.toLowerCase()]
    if (!iconInfo) {
      return (
        <Code className="w-4 h-4" style={{ color: '#888' }} />
      )
    }

    const iconPath = getIconPath(iconInfo.name)
    if (!iconPath) {
      return (
        <Code className="w-4 h-4" style={{ color: '#888' }} />
      )
    }

    return (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill={iconInfo.color}
      >
        <path d={iconPath} />
      </svg>
    )
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
          const languageIcon = getLanguageIcon(snippet.language)
          const lineRange = snippet.selectedLines.start === snippet.selectedLines.end 
            ? `L${snippet.selectedLines.start}` 
            : `L${snippet.selectedLines.start}-${snippet.selectedLines.end}`
          
          return (
            <div
              key={snippet.id}
              className="glass-effect p-4 rounded-xl border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 transition-all duration-200 neon-glow-hover cursor-pointer group relative flex flex-col h-full active:scale-95"
              onClick={() => setSelectedSnippet(snippet)}
            >
              {/* Header with actions */}
              <div className="relative mb-3">
                {/* Title and subtitle - full width when buttons are hidden */}
                <div className="text-left sm:group-hover:pr-40 transition-all duration-200">
                  <div className="font-medium text-[var(--dark-text)] truncate text-sm text-left">
                    {snippet.title}
                  </div>
                  <div className="text-xs text-[var(--dark-text-secondary)] truncate mt-1 text-left">
                    {snippet.repo.name}
                    {snippet.branch && snippet.branch !== snippet.repo.default_branch && (
                      <span className="text-[var(--neon-purple)] mx-1">:{snippet.branch}</span>
                    )}
                    /{snippet.file.path} {lineRange}
                  </div>
                </div>
                
                {/* Action buttons - positioned absolutely on desktop, inline on mobile */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 sm:absolute sm:top-0 sm:right-0 mt-2 sm:mt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileSelect(snippet.repo, snippet.file, snippet.branch)
                    }}
                    className="p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-[var(--dark-bg-secondary)] text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)]"
                    title="View full file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => copySnippet(snippet, e)}
                    className="p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-[var(--dark-bg-secondary)] text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)]"
                    title="Copy snippet"
                  >
                    {copiedSnippet === snippet.id ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`https://github.com/${snippet.repo.full_name}/blob/${snippet.branch}/${snippet.file.path}#L${snippet.selectedLines.start}-L${snippet.selectedLines.end}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-[var(--dark-bg-secondary)] text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)]"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={(e) => removeRecentSnippet(snippet.id, e)}
                    className="p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-[var(--dark-bg-secondary)] text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)]"
                    title="Remove snippet"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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
                  <div className="w-4 h-4 flex items-center justify-center">
                    {languageIcon}
                  </div>
                  <span className="text-[var(--neon-purple)]">{snippet.language}</span>
                </div>
                <TimePill timestamp={snippet.timestamp} />
              </div>
            </div>
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