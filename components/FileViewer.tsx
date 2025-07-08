'use client'

import { useState, useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { useGitHub } from '@/hooks/useGitHub'
import { File, ExternalLink, Copy, CheckCircle, Camera, BookmarkPlus } from 'lucide-react'
import CodeSnippetShare from './CodeSnippetShare'
import { RecentSnippetsManager } from '@/lib/recentSnippets'

interface FileViewerProps {
  repo: GitHubRepo
  file: GitHubFile
  branch?: string
  onClose: () => void
  onSnippetSaved?: () => void
}

export default function FileViewer({ repo, file, branch, onClose, onSnippetSaved }: FileViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedLines, setSelectedLines] = useState<{ start: number; end: number } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [snippetSaved, setSnippetSaved] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)
  const { github } = useGitHub()

  useEffect(() => {
    const loadFileContent = async () => {
      if (!github) return

      setLoading(true)
      setError(null)
      try {
        const repoInfo = { owner: repo.full_name.split('/')[0], repo: repo.name }
        const fileContent = await github.getFileContent(repoInfo.owner, repoInfo.repo, file.path, branch)
        setContent(fileContent.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file')
      } finally {
        setLoading(false)
      }
    }

    loadFileContent()
  }, [github, repo, file, branch])

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        // Reset search bar when closing via escape
        if (window.searchBarRef?.resetSearchBar) {
          window.searchBarRef.resetSearchBar()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const copyToClipboard = async () => {
    try {
      const textToCopy = selectedLines ? getSelectedCode() : content
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getSelectedCode = () => {
    if (!selectedLines || !content) return ''
    const lines = content.split('\n')
    return lines.slice(selectedLines.start - 1, selectedLines.end).join('\n')
  }

  const handleLineSelection = () => {
    if (!codeRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectedLines(null)
      return
    }

    // Find the start and end line numbers
    const range = selection.getRangeAt(0)
    const codeElement = codeRef.current.querySelector('code')
    
    if (!codeElement) return

    // Get all line elements
    const lineElements = codeElement.querySelectorAll('.linenumber')
    if (lineElements.length === 0) return

    // Find which lines are selected
    let startLine = 1
    let endLine = 1

    try {
      // Get the text content and find line positions
      const fullText = codeElement.textContent || ''
      const selectedText = selection.toString()
      
      if (!selectedText.trim()) {
        setSelectedLines(null)
        return
      }

      const beforeSelection = fullText.substring(0, fullText.indexOf(selectedText))
      const linesBeforeSelection = beforeSelection.split('\n').length
      const selectedTextLines = selectedText.split('\n').length

      startLine = linesBeforeSelection
      endLine = linesBeforeSelection + selectedTextLines - 1

      // Ensure we have valid line numbers
      if (startLine > 0 && endLine > 0 && endLine >= startLine) {
        setSelectedLines({ start: startLine, end: endLine })
      }
    } catch (error) {
      console.error('Error calculating line selection:', error)
      setSelectedLines(null)
    }
  }

  const clearSelection = () => {
    setSelectedLines(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleShareClick = () => {
    if (selectedLines) {
      setShowShareModal(true)
    }
  }

  const saveSnippet = () => {
    if (!selectedLines) return
    
    const selectedCode = getSelectedCode()
    const currentBranch = branch || repo.default_branch
    
    RecentSnippetsManager.addRecentSnippet(
      repo,
      file,
      currentBranch,
      selectedLines,
      selectedCode,
      language
    )
    
    setSnippetSaved(true)
    setTimeout(() => setSnippetSaved(false), 2000)
    
    // Notify parent component to refresh recent snippets
    if (onSnippetSaved) {
      onSnippetSaved()
    }
  }

  const language = getFileLanguage(file.name)

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
          // Reset search bar when closing via backdrop click
          if (window.searchBarRef?.resetSearchBar) {
            window.searchBarRef.resetSearchBar()
          }
        }
      }}
    >
      <div className="glass-effect rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="p-6 border-b border-[var(--dark-border)]">
          {/* File info row with close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <File className="w-6 h-6 text-[var(--neon-purple)]" />
              <div className="text-left">
                <h2 className="font-semibold text-xl text-[var(--dark-text)] text-left">{file.name}</h2>
                <p className="text-sm text-[var(--dark-text-secondary)] mt-1 text-left">
                  {repo.full_name}
                  {branch && branch !== repo.default_branch && (
                    <span className="text-[var(--neon-purple)] mx-1">:{branch}</span>
                  )}
                  /{file.path}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {selectedLines && (
                <div className="text-sm text-[var(--neon-purple)] bg-[var(--neon-purple)]/20 px-3 py-1 rounded-full border border-[var(--neon-purple)]/30">
                  Lines {selectedLines.start}-{selectedLines.end} selected
                  <button
                    onClick={clearSelection}
                    className="text-xs hover:text-[var(--neon-purple-bright)] ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <button
                onClick={() => {
                  onClose()
                  // Reset search bar when closing via close button
                  if (window.searchBarRef?.resetSearchBar) {
                    window.searchBarRef.resetSearchBar()
                  }
                }}
                className="px-3 py-2 text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] text-2xl transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
              >
                ×
              </button>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {selectedLines ? 'Selection Copied!' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {selectedLines ? 'Copy Selection' : 'Copy'}
                </>
              )}
            </button>

            {selectedLines && (
              <>
                <button
                  onClick={saveSnippet}
                  className="flex items-center gap-2 px-4 py-2 text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
                >
                  {snippetSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      Save Snippet
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-purple-bright)] text-white hover:from-[var(--neon-purple-bright)] hover:to-[var(--neon-purple)] rounded-lg transition-all duration-200 neon-glow-hover"
                >
                  <Camera className="w-4 h-4" />
                  Share Snippet
                </button>
              </>
            )}
            
            <a
              href={`https://github.com/${repo.full_name}/blob/${branch || repo.default_branch}/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple-bright)] rounded-lg transition-all duration-200 neon-glow-hover"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-[var(--dark-text-secondary)] flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--neon-purple)]"></div>
                Loading file content...
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-400">Error: {error}</div>
            </div>
          ) : (
            <>
              {!selectedLines && (
                <div className="px-6 py-3 bg-[var(--neon-purple)]/10 border-b border-[var(--neon-purple)]/20">
                  <p className="text-sm text-[var(--neon-purple)]">
                    💡 Tip: Select lines of code to save as snippet or share as a beautiful screenshot!
                  </p>
                </div>
              )}
              <div 
                ref={codeRef}
                onMouseUp={handleLineSelection}
                className="select-text"
              >
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  showLineNumbers
                  wrapLines
                >
                  {content}
                </SyntaxHighlighter>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && selectedLines && (
        <CodeSnippetShare
          repo={repo}
          file={file}
          selectedCode={getSelectedCode()}
          selectedLines={selectedLines}
          language={language}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}