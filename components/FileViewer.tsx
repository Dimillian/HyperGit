'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GitHubRepo, GitHubFile, getFileLanguage } from '@/lib/github/api'
import { useGitHub } from '@/hooks/useGitHub'
import { File, ExternalLink, Copy, CheckCircle } from 'lucide-react'

interface FileViewerProps {
  repo: GitHubRepo
  file: GitHubFile
  onClose: () => void
}

export default function FileViewer({ repo, file, onClose }: FileViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { github } = useGitHub()

  useEffect(() => {
    const loadFileContent = async () => {
      if (!github) return

      setLoading(true)
      setError(null)
      try {
        const repoInfo = { owner: repo.full_name.split('/')[0], repo: repo.name }
        const fileContent = await github.getFileContent(repoInfo.owner, repoInfo.repo, file.path)
        setContent(fileContent.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file')
      } finally {
        setLoading(false)
      }
    }

    loadFileContent()
  }, [github, repo, file])

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
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const language = getFileLanguage(file.name)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-[var(--neon-purple)]/30 neon-glow">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <File className="w-6 h-6 text-[var(--neon-purple)]" />
            <div>
              <h2 className="font-semibold text-xl text-[var(--dark-text)]">{file.name}</h2>
              <p className="text-sm text-[var(--dark-text-secondary)]">{repo.full_name}/{file.path}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
            
            <a
              href={`https://github.com/${repo.full_name}/blob/${repo.default_branch}/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple-bright)] rounded-lg transition-all duration-200 neon-glow-hover"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
            
            <button
              onClick={onClose}
              className="ml-2 px-3 py-2 text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] text-2xl transition-colors duration-200 rounded hover:bg-[var(--neon-purple)]/10"
            >
              ×
            </button>
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
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'var(--dark-bg-secondary)',
                fontSize: '14px',
                lineHeight: '1.6',
                borderRadius: '0 0 1rem 1rem'
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                textAlign: 'right',
                userSelect: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--dark-text-secondary)',
                outline: 'none',
                boxShadow: 'none'
              }}
              lineProps={{
                style: {
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none'
                }
              }}
            >
              {content}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </div>
  )
}