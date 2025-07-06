'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-gray-600" />
            <div>
              <h2 className="font-semibold text-lg">{file.name}</h2>
              <p className="text-sm text-gray-600">{repo.full_name}/{file.path}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
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
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
            
            <button
              onClick={onClose}
              className="ml-2 px-3 py-2 text-gray-500 hover:text-gray-700 text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading file content...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={oneLight}
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '14px',
                lineHeight: '1.5'
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