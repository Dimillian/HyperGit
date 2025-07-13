'use client'

import { useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { RecentSnippet } from '@/lib/recentSnippets'
import { Camera, Share2, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import { downloadScreenshot, copyScreenshotToClipboard } from '@/lib/screenshot'

interface SnippetViewerProps {
  snippet: RecentSnippet
  onClose: () => void
}

export default function SnippetViewer({ snippet, onClose }: SnippetViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [screenshotCopied, setScreenshotCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateScreenshot = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      const cardElement = cardRef.current.querySelector('.screenshot-card') as HTMLElement
      if (!cardElement) return

      const filename = `${snippet.repo.name}-${snippet.file.name}-L${snippet.selectedLines.start}-${snippet.selectedLines.end}.png`
      await downloadScreenshot(cardElement, filename)
    } catch (error) {
      console.error('Error generating screenshot:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyScreenshot = async () => {
    if (!cardRef.current) return

    setIsCopying(true)
    try {
      const cardElement = cardRef.current.querySelector('.screenshot-card') as HTMLElement
      if (!cardElement) return

      await copyScreenshotToClipboard(cardElement)
      setScreenshotCopied(true)
      setTimeout(() => setScreenshotCopied(false), 2000)
    } catch (error) {
      console.error('Error copying screenshot:', error)
    } finally {
      setIsCopying(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareSnippet = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Code Snippet: ${snippet.title}`,
          text: snippet.code,
          url: `https://github.com/${snippet.repo.full_name}/blob/${snippet.branch}/${snippet.file.path}#L${snippet.selectedLines.start}-L${snippet.selectedLines.end}`
        })
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback: copy GitHub URL to clipboard
      const url = `https://github.com/${snippet.repo.full_name}/blob/${snippet.branch}/${snippet.file.path}#L${snippet.selectedLines.start}-L${snippet.selectedLines.end}`
      await navigator.clipboard.writeText(url)
    }
  }

  const lineRange = snippet.selectedLines.start === snippet.selectedLines.end 
    ? `L${snippet.selectedLines.start}` 
    : `L${snippet.selectedLines.start}-${snippet.selectedLines.end}`

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="p-6 border-b border-[var(--dark-border)]">
          {/* Action buttons row with close button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="sm:inline">Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={generateScreenshot}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-purple-bright)] text-white hover:from-[var(--neon-purple-bright)] hover:to-[var(--neon-purple)] rounded-lg transition-all duration-200 neon-glow-hover disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="sm:inline">Screenshot</span>
                  </>
                )}
              </button>

              <button
                onClick={copyScreenshot}
                disabled={isCopying}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50 disabled:opacity-50"
              >
                {isCopying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    <span className="sm:inline">Copying...</span>
                  </>
                ) : screenshotCopied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="sm:inline">Screenshot Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="sm:inline">Copy Screenshot</span>
                  </>
                )}
              </button>

              <button
                onClick={shareSnippet}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
              >
                <Share2 className="w-5 h-5" />
                <span className="sm:inline">Share</span>
              </button>
              
              <a
                href={`https://github.com/${snippet.repo.full_name}/blob/${snippet.branch}/${snippet.file.path}#L${snippet.selectedLines.start}-L${snippet.selectedLines.end}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple-bright)] rounded-lg transition-all duration-200 neon-glow-hover"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="sm:inline">GitHub</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] text-2xl transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div 
            ref={cardRef}
            style={{ 
              width: 'fit-content',
              maxWidth: '1200px', // Reasonable max width
              minWidth: '600px', // Minimum width for readability
              margin: '0 auto' // Center the content
            }}
          >
            <div className="screenshot-card border border-[#a855f7]/30 overflow-hidden bg-[#0f0f0f]">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-[#1a1a1a] bg-gradient-to-r from-[#0a0a0a] to-[#111111]">
                <div className="text-left">
                  <h3 className="font-semibold text-[#e5e5e5] text-lg text-left">{snippet.title}</h3>
                  <p className="text-sm text-[#a3a3a3] mt-1 text-left">
                    {snippet.repo.full_name}
                    {snippet.branch && snippet.branch !== snippet.repo.default_branch && (
                      <span className="text-[#a855f7] mx-1">:{snippet.branch}</span>
                    )}
                    /{snippet.file.path} {lineRange}
                  </p>
                </div>
              </div>

              {/* Code Content */}
              <div className="relative">
                <SyntaxHighlighter
                  language={snippet.language}
                  style={oneDark}
                  showLineNumbers
                  startingLineNumber={snippet.selectedLines.start}
                  wrapLines
                  customStyle={{
                    margin: 0,
                    borderRadius: '0',
                  }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 border-t border-[#1a1a1a] bg-gradient-to-r from-[#0a0a0a] to-[#111111]">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a3a3a3]">Language:</span>
                    <span className="text-[#a855f7] font-medium">{snippet.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#a3a3a3]">Lines:</span>
                    <span className="text-[#a855f7] font-medium">
                      {snippet.selectedLines.end - snippet.selectedLines.start + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}