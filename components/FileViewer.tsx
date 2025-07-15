'use client'

import { useState, useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { useGitHub } from '@/hooks/useGitHub'
import { File, ExternalLink, Copy, CheckCircle, Camera, BookmarkPlus } from 'lucide-react'
import SnippetViewer from './SnippetViewer'
import { RecentSnippetsManager, RecentSnippet } from '@/lib/recentSnippets'

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
  const [,] = useState(false) // setIsSelecting not used currently
  const [currentSnippet, setCurrentSnippet] = useState<RecentSnippet | null>(null)
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

  const handleLineSelection = (e: React.MouseEvent) => {
    // Prevent event bubbling to avoid modal dismissal
    e.stopPropagation()
    
    if (!codeRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectedLines(null)
      return
    }

    try {
      const range = selection.getRangeAt(0)
      const codeElement = codeRef.current.querySelector('pre code')
      
      if (!codeElement) return

      // Get all line number spans
      const lineNumberSpans = Array.from(codeElement.querySelectorAll('span[data-line-number]'))
      
      if (lineNumberSpans.length === 0) {
        // Improved fallback: look for line number spans more specifically
        const allSpans = Array.from(codeElement.querySelectorAll('span'))
        const lineSpans = allSpans.filter(span => {
          const text = span.textContent?.trim() || ''
          // Must be just digits
          if (!/^\d+$/.test(text) || parseInt(text) === 0) return false
          
          // Additional check: line number spans are typically the first child of their parent
          // and not deeply nested in syntax highlighting structure
          const parent = span.parentElement
          if (!parent) return false
          
          // Check if this span is likely a line number by its position and context
          const isFirstChild = parent.firstElementChild === span
          const hasCodeSibling = parent.children.length > 1
          
          // Line numbers are usually first child and have code siblings
          return isFirstChild && hasCodeSibling
        })
        
        if (lineSpans.length === 0) {
          setSelectedLines(null)
          return
        }
        
        // Find the first and last line within the selection
        let startLine = null
        let endLine = null
        
        // More precise approach: check if selection intersects with each line
        for (const span of lineSpans) {
          const lineNum = parseInt(span.textContent || '0')
          if (lineNum === 0) continue
          
          // Get the entire line container (parent of the line number span)
          const lineContainer = span.parentElement
          if (!lineContainer) continue
          
          // Check if the selection range intersects with this line
          const lineRange = document.createRange()
          lineRange.selectNodeContents(lineContainer)
          
          try {
            // Check if the selection range intersects with this line range
            const selectionRange = selection.getRangeAt(0)
            const intersects = selectionRange.compareBoundaryPoints(Range.END_TO_START, lineRange) <= 0 &&
                              selectionRange.compareBoundaryPoints(Range.START_TO_END, lineRange) >= 0
            
            if (intersects) {
              if (startLine === null || lineNum < startLine) startLine = lineNum
              if (endLine === null || lineNum > endLine) endLine = lineNum
            }
          } catch {
            // Fallback to containsNode if range comparison fails
            if (selection.containsNode(lineContainer, true)) {
              if (startLine === null || lineNum < startLine) startLine = lineNum
              if (endLine === null || lineNum > endLine) endLine = lineNum
            }
          }
        }
        
        if (startLine && endLine) {
          setSelectedLines({ start: startLine, end: endLine })
        } else {
          setSelectedLines(null)
        }
        return
      }

      // Modern approach with data attributes
      let startLine = null
      let endLine = null

      for (const span of lineNumberSpans) {
        if (selection.containsNode(span.parentElement || span, true)) {
          const lineNum = parseInt(span.getAttribute('data-line-number') || '0')
          if (lineNum > 0) {
            if (startLine === null || lineNum < startLine) startLine = lineNum
            if (endLine === null || lineNum > endLine) endLine = lineNum
          }
        }
      }

      if (startLine && endLine) {
        setSelectedLines({ start: startLine, end: endLine })
      } else {
        // Try alternative method: analyze the selection range
        const startContainer = range.startContainer
        const endContainer = range.endContainer
        
        // Find the closest line number for start and end
        const findLineNumber = (node: Node): number | null => {
          let current: Node | null = node
          while (current) {
            if (current.nodeType === Node.ELEMENT_NODE) {
              const element = current as Element
              // Check if this element or its children contain a line number
              const lineNumSpan = element.querySelector?.('span[data-line-number]')
              
              if (lineNumSpan) {
                const num = lineNumSpan.getAttribute?.('data-line-number')
                if (num && /^\d+$/.test(num)) {
                  return parseInt(num)
                }
              }
            }
            current = current.parentNode
          }
          return null
        }
        
        const startLineNum = findLineNumber(startContainer)
        const endLineNum = findLineNumber(endContainer)
        
        if (startLineNum && endLineNum) {
          setSelectedLines({ 
            start: Math.min(startLineNum, endLineNum), 
            end: Math.max(startLineNum, endLineNum) 
          })
        } else {
          setSelectedLines(null)
        }
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
    if (!selectedLines) return
    
    // Create a snippet and show the SnippetViewer
    const snippetCode = getSelectedCode()
    const language = getFileLanguage(file.name)
    const title = `${repo.name}/${file.name} (L${selectedLines.start}-${selectedLines.end})`
    
    // Add to recent snippets
    RecentSnippetsManager.addRecentSnippet(
      repo,
      file,
      branch || repo.default_branch,
      selectedLines,
      snippetCode,
      language,
      title
    )
    
    // Create snippet object for SnippetViewer
    const snippet: RecentSnippet = {
      id: `${repo.full_name}-${file.path}-${branch || repo.default_branch}-${selectedLines.start}-${selectedLines.end}-${Date.now()}`,
      repo,
      file,
      branch: branch || repo.default_branch,
      selectedLines,
      code: snippetCode,
      language,
      title,
      timestamp: Date.now()
    }
    
    setCurrentSnippet(snippet)
    onSnippetSaved?.()
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
      data-modal="file-viewer"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => {
        // Only close if clicking directly on the backdrop (not on the modal content)
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="glass-effect rounded-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="p-6 border-b border-[var(--dark-border)]">
          {/* File info row with close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <File className="w-6 h-6 text-[var(--neon-purple)]" />
              <div className="text-left">
                <h2 className="font-semibold text-xl text-[var(--dark-text)] text-left">{file.name}</h2>
                <div className="text-sm text-[var(--dark-text-secondary)] mt-1 text-left flex items-center flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Set search to just the repo
                      if (window.searchBarRef?.selectRepositoryFromCard) {
                        window.searchBarRef.selectRepositoryFromCard(repo)
                        onClose() // Close the file viewer
                      }
                    }}
                    className="hover:text-[var(--neon-purple)] hover:underline transition-colors"
                  >
                    {repo.full_name}
                  </button>
                  {branch && branch !== repo.default_branch && (
                    <span className="text-[var(--neon-purple)] mx-1">:{branch}</span>
                  )}
                  <span className="mx-1">/</span>
                  {file.path.split('/').map((part, index, parts) => {
                    const isLast = index === parts.length - 1
                    const isFile = isLast && file.type === 'file'
                    
                    return (
                      <span key={index} className="inline-flex items-center">
                        {!isFile ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Restore search to this folder
                              if (window.searchBarRef) {
                                // Set the query to navigate to this specific folder
                                const searchQuery = `@${repo.name}${branch && branch !== repo.default_branch ? `:${branch}` : ''}/${parts.slice(0, index + 1).join('/')}/`
                                window.searchBarRef.setSearchQuery(searchQuery).then(() => {
                                  window.searchBarRef?.inputRef?.current?.focus()
                                })
                                onClose() // Close the file viewer
                              }
                            }}
                            className="hover:text-[var(--neon-purple)] hover:underline transition-colors"
                          >
                            {part}
                          </button>
                        ) : (
                          <span>{part}</span>
                        )}
                        {!isLast && <span className="mx-1">/</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedLines && (
                <div className="flex items-center text-sm text-[var(--neon-purple)] bg-[var(--neon-purple)]/20 px-3 py-1 rounded-full border border-[var(--neon-purple)]/30">
                  <span>Lines {selectedLines.start}-{selectedLines.end} selected</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm hover:text-[var(--neon-purple-bright)] ml-2 w-4 h-4 flex items-center justify-center rounded"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <button
                onClick={() => {
                  onClose()
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] text-2xl transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
              >
                ×
              </button>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="sm:inline">{selectedLines ? 'Selection Copied!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="sm:inline">{selectedLines ? 'Copy Selection' : 'Copy'}</span>
                  </>
                )}
              </button>

              {selectedLines && (
                <>
                  <button
                    onClick={saveSnippet}
                    className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
                  >
                    {snippetSaved ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="sm:inline">Saved!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-5 h-5" />
                        <span className="sm:inline">Save Snippet</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShareClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-purple-bright)] text-white hover:from-[var(--neon-purple-bright)] hover:to-[var(--neon-purple)] rounded-lg transition-all duration-200 neon-glow-hover"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="sm:inline">Share Snippet</span>
                  </button>
                </>
              )}
            </div>
            
            <a
              href={`https://github.com/${repo.full_name}/blob/${branch || repo.default_branch}/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple-bright)] rounded-lg transition-all duration-200 neon-glow-hover"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="sm:inline">GitHub</span>
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
              <div 
                ref={codeRef}
                onMouseUp={handleLineSelection}
                className="select-text"
                onClick={(e) => e.stopPropagation()}
              >
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    borderRadius: 0,
                    margin: 0
                  }}
                >
                  {content}
                </SyntaxHighlighter>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Snippet Viewer */}
      {currentSnippet && (
        <SnippetViewer
          snippet={currentSnippet}
          onClose={() => setCurrentSnippet(null)}
        />
      )}
    </div>
  )
}