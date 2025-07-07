'use client'

import { useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile } from '@/lib/github/api'
import { Camera, Download, X, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

interface CodeSnippetShareProps {
  repo: GitHubRepo
  file: GitHubFile
  selectedCode: string
  selectedLines: { start: number; end: number }
  language: string
  onClose: () => void
}

export default function CodeSnippetShare({
  repo,
  file,
  selectedCode,
  selectedLines,
  language,
  onClose
}: CodeSnippetShareProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateScreenshot = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      // Use the wrapper element for cleaner capture
      const element = cardRef.current
      
      // Force a reflow to ensure all content is rendered
      element.style.display = 'block'
      element.offsetHeight // Force reflow
      
      // Longer delay to ensure fonts and content are fully rendered
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Get accurate dimensions including any overflow
      const rect = element.getBoundingClientRect()
      const computedHeight = Math.max(element.offsetHeight, element.scrollHeight, rect.height)
      
      const canvas = await html2canvas(element, {
        backgroundColor: 'transparent',
        scale: 2, // High DPI for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: computedHeight + 30, // Add extra 30px for text descenders
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      } as any)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${repo.name}-${file.name}-lines-${selectedLines.start}-${selectedLines.end}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('Failed to generate screenshot:', error)
    } finally {
      setIsGenerating(false)
    }
  }


  const copyLink = async () => {
    const url = `https://github.com/${repo.full_name}/blob/${repo.default_branch}/${file.path}#L${selectedLines.start}-L${selectedLines.end}`
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-[var(--neon-purple)]" />
            <div>
              <h2 className="font-semibold text-xl text-[var(--dark-text)]">Share Code Snippet</h2>
              <p className="text-sm text-[var(--dark-text-secondary)]">
                Lines {selectedLines.start}-{selectedLines.end} from {file.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="px-3 py-2 text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] text-2xl transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-[var(--dark-text)] mb-4">Preview</h3>
            
            {/* Wrapper for screenshot */}
            <div 
              ref={cardRef}
              className="bg-transparent"
              style={{ 
                width: '832px', // 800px + 32px padding
                padding: '16px',
                margin: '20px 0' // Margin to prevent boundary issues
              }}
            >
              {/* The actual card */}
              <div className="screenshot-card bg-[#0f0f0f] rounded-xl border border-[var(--neon-purple)]/30 overflow-hidden" style={{ paddingBottom: '8px' }}>
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[var(--neon-purple)]/15 to-[var(--neon-purple-bright)]/15 px-4 py-4 border-b border-[var(--neon-purple)]/20 flex-shrink-0 flex flex-col justify-center">
                <div className="text-lg font-semibold text-[var(--dark-text)] truncate leading-relaxed mb-1">{repo.full_name}</div>
                <div className="text-sm text-[var(--dark-text-secondary)] truncate leading-relaxed" style={{ paddingBottom: '4px' }}>
                  {file.path} • Lines {selectedLines.start}-{selectedLines.end}
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6">
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  showLineNumbers
                  startingLineNumber={selectedLines.start}
                >
                  {selectedCode}
                </SyntaxHighlighter>
              </div>

              {/* Card Footer */}
              <div className="border-t border-[var(--neon-purple)]/20 px-4 py-4 flex-shrink-0 flex items-center">
                <div className="flex justify-between items-center text-xs text-[var(--dark-text-secondary)] leading-loose w-full" style={{ paddingBottom: '4px' }}>
                  <span className="truncate mr-4">github.com/{repo.full_name}</span>
                  <span className="whitespace-nowrap">Generated with HyperGit.app</span>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[var(--dark-border)]">
            <button
              onClick={generateScreenshot}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple-bright)] rounded-lg transition-all duration-200 neon-glow-hover disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Screenshot
                </>
              )}
            </button>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 shiny-surface text-[var(--dark-text)] hover:bg-[var(--neon-purple)]/20 rounded-lg transition-all duration-200 border border-[var(--dark-border)] hover:border-[var(--neon-purple)]/50"
            >
              <Share2 className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}