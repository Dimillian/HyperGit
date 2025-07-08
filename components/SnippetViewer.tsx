'use client'

import { useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { RecentSnippet } from '@/lib/recentSnippets'
import { Camera, Share2, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import html2canvas from 'html2canvas'

interface SnippetViewerProps {
  snippet: RecentSnippet
  onClose: () => void
}

export default function SnippetViewer({ snippet, onClose }: SnippetViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateScreenshot = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      // Capture the inner card element
      const cardElement = cardRef.current.querySelector('.screenshot-card') as HTMLElement
      if (!cardElement) return

      // Force a reflow to ensure all content is rendered
      cardElement.style.display = 'block'
      cardElement.offsetHeight // Force reflow
      
      // Longer delay to ensure fonts and content are fully rendered
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Get accurate dimensions including any overflow
      const rect = cardElement.getBoundingClientRect()
      const computedHeight = Math.max(cardElement.offsetHeight, cardElement.scrollHeight, rect.height)
      
      const canvas = await html2canvas(cardElement, {
        height: computedHeight + 20, // Extra space for text descenders
        useCORS: true,
        allowTaint: true,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${snippet.repo.name}-${snippet.file.name}-L${snippet.selectedLines.start}-${snippet.selectedLines.end}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error generating screenshot:', error)
    } finally {
      setIsGenerating(false)
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
      <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="p-6 border-b border-[var(--dark-border)]">
          {/* Action buttons row with close button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={generateScreenshot}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-purple-bright)] text-white hover:from-[var(--neon-purple-bright)] hover:to-[var(--neon-purple)] rounded-lg transition-all duration-200 neon-glow-hover disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Screenshot
                  </>
                )}
              </button>

              <button
                onClick={shareSnippet}
                className="flex items-center gap-2 px-4 py-2 text-sm shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              
              <a
                href={`https://github.com/${snippet.repo.full_name}/blob/${snippet.branch}/${snippet.file.path}#L${snippet.selectedLines.start}-L${snippet.selectedLines.end}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple-bright)] rounded-lg transition-all duration-200 neon-glow-hover"
              >
                <ExternalLink className="w-4 h-4" />
                GitHub
              </a>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-2 text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] text-2xl transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div ref={cardRef}>
            <div className="screenshot-card glass-effect rounded-xl border border-[var(--neon-purple)]/30 overflow-hidden">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-[var(--dark-border)] bg-gradient-to-r from-[var(--dark-bg-secondary)] to-[var(--dark-bg-tertiary)]">
                <div className="text-left">
                  <h3 className="font-semibold text-[var(--dark-text)] text-lg text-left">{snippet.title}</h3>
                  <p className="text-sm text-[var(--dark-text-secondary)] mt-1 text-left">
                    {snippet.repo.full_name}
                    {snippet.branch && snippet.branch !== snippet.repo.default_branch && (
                      <span className="text-[var(--neon-purple)] mx-1">:{snippet.branch}</span>
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
              <div className="px-6 py-4 border-t border-[var(--dark-border)] bg-gradient-to-r from-[var(--dark-bg-secondary)] to-[var(--dark-bg-tertiary)]">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--dark-text-secondary)]">Language:</span>
                    <span className="text-[var(--neon-purple)] font-medium">{snippet.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--dark-text-secondary)]">Lines:</span>
                    <span className="text-[var(--neon-purple)] font-medium">
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