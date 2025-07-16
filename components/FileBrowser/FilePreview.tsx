'use client'

import { useState, useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { useGitHub } from '@/hooks/useGitHub'
import { Copy, CheckCircle, Camera, BookmarkPlus, ExternalLink } from 'lucide-react'
import { RecentSnippetsManager, RecentSnippet } from '@/lib/recentSnippets'
import SnippetViewer from '../SnippetViewer'
import Breadcrumb from './Breadcrumb'

interface FilePreviewProps {
  repo: GitHubRepo
  file: GitHubFile
  branch: string
  onSnippetSaved?: () => void
  onNavigate?: (path: string) => void
}

export default function FilePreview({ repo, file, branch, onSnippetSaved, onNavigate }: FilePreviewProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedLines, setSelectedLines] = useState<{ start: number; end: number } | null>(null)
  const [currentSnippet, setCurrentSnippet] = useState<RecentSnippet | null>(null)
  const [snippetSaved, setSnippetSaved] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)
  const { github } = useGitHub()

  useEffect(() => {
    const loadFileContent = async () => {
      if (!github || file.type !== 'file') return

      setLoading(true)
      setError(null)
      setContent('')
      setSelectedLines(null)

      try {
        const [owner] = repo.full_name.split('/')
        const fileContent = await github.getFileContent(owner, repo.name, file.path, branch)
        setContent(fileContent.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file')
      } finally {
        setLoading(false)
      }
    }

    loadFileContent()
  }, [github, repo, file, branch])

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
    e.stopPropagation()
    
    if (!codeRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectedLines(null)
      return
    }

    try {
      const codeElement = codeRef.current.querySelector('pre code')
      if (!codeElement) return

      // Get all line number spans
      const lineNumberSpans = Array.from(codeElement.querySelectorAll('span[data-line-number]'))
      
      if (lineNumberSpans.length === 0) {
        // Fallback for line number detection
        const allSpans = Array.from(codeElement.querySelectorAll('span'))
        const lineSpans = allSpans.filter(span => {
          const text = span.textContent?.trim() || ''
          if (!/^\d+$/.test(text) || parseInt(text) === 0) return false
          
          const parent = span.parentElement
          if (!parent) return false
          
          const isFirstChild = parent.firstElementChild === span
          const hasCodeSibling = parent.children.length > 1
          
          return isFirstChild && hasCodeSibling
        })
        
        if (lineSpans.length === 0) {
          setSelectedLines(null)
          return
        }
        
        let startLine = null
        let endLine = null
        
        for (const span of lineSpans) {
          const lineNum = parseInt(span.textContent || '0')
          if (lineNum === 0) continue
          
          const lineContainer = span.parentElement
          if (!lineContainer) continue
          
          const lineRange = document.createRange()
          lineRange.selectNodeContents(lineContainer)
          
          try {
            const selectionRange = selection.getRangeAt(0)
            const intersects = selectionRange.compareBoundaryPoints(Range.END_TO_START, lineRange) <= 0 &&
                              selectionRange.compareBoundaryPoints(Range.START_TO_END, lineRange) >= 0
            
            if (intersects) {
              if (startLine === null || lineNum < startLine) startLine = lineNum
              if (endLine === null || lineNum > endLine) endLine = lineNum
            }
          } catch {
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
      } else {
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
    
    const snippetCode = getSelectedCode()
    const language = getFileLanguage(file.name)
    const title = `${repo.name}/${file.name} (L${selectedLines.start}-${selectedLines.end})`
    
    RecentSnippetsManager.addRecentSnippet(
      repo,
      file,
      branch,
      selectedLines,
      snippetCode,
      language,
      title
    )
    
    const snippet: RecentSnippet = {
      id: `${repo.full_name}-${file.path}-${branch}-${selectedLines.start}-${selectedLines.end}-${Date.now()}`,
      repo,
      file,
      branch,
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
    const language = getFileLanguage(file.name)
    
    RecentSnippetsManager.addRecentSnippet(
      repo,
      file,
      branch,
      selectedLines,
      selectedCode,
      language
    )
    
    setSnippetSaved(true)
    setTimeout(() => setSnippetSaved(false), 2000)
    
    if (onSnippetSaved) {
      onSnippetSaved()
    }
  }

  const language = getFileLanguage(file.name)

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb Navigation */}
      {onNavigate && (
        <Breadcrumb
          repositoryName={repo.name}
          currentPath={file.path}
          onNavigate={onNavigate}
        />
      )}
      
      {/* File Header */}
      <div className="p-4 border-b border-[var(--dark-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-[var(--dark-text)]">{file.name}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedLines && (
              <div className="flex items-center text-sm text-[var(--neon-purple)] bg-[var(--neon-purple)]/20 px-3 py-1 rounded-full border border-[var(--neon-purple)]/30">
                <span>Lines {selectedLines.start}-{selectedLines.end}</span>
                <button
                  onClick={clearSelection}
                  className="ml-2 hover:text-[var(--neon-purple-bright)]"
                >
                  ×
                </button>
              </div>
            )}
            
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 text-sm shiny-surface hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{selectedLines ? 'Copy Selection' : 'Copy All'}</span>
                </>
              )}
            </button>

            {selectedLines && (
              <>
                <button
                  onClick={saveSnippet}
                  className="flex items-center gap-2 px-3 py-2 text-sm shiny-surface hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all"
                >
                  {snippetSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-purple-bright)] text-white rounded-lg transition-all hover:neon-glow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </>
            )}

            <a
              href={`https://github.com/${repo.full_name}/blob/${branch}/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--neon-purple)] text-white rounded-lg transition-all hover:bg-[var(--neon-purple-bright)]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* File Content */}
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