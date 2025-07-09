'use client'

import { useState } from 'react'
import { useGitHub } from '@/hooks/useGitHub'
import { Github } from 'lucide-react'

export default function AuthPrompt() {
  const [token, setToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const { setToken: saveToken, error, loading } = useGitHub()

  const handleSaveToken = () => {
    if (token.trim()) {
      saveToken(token.trim())
      setToken('')
      setShowTokenInput(false)
    }
  }

  const handleOAuthLogin = () => {
    window.location.href = '/api/auth/github'
  }

  return (
    <div className="text-center space-y-8 max-w-md mx-auto">
      <div className="space-y-3">
        <div className="w-20 h-20 text-[var(--neon-purple)] flex items-center justify-center mx-auto">
          <svg 
            viewBox="0 0 16 16"
            className="w-full h-full"
          >
            {/* GitHub Icon - original size and position */}
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" 
                  fill="currentColor"/>
            {/* Lightning Bolt - simple version without effects */}
            <path d="M10 0l-3 7h2l-2 9 4-8h-2l3-8z" 
                  fill="#fbbf24" 
                  stroke="#000" 
                  strokeWidth="0.2"
                  opacity="0.95"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--dark-text)] via-[var(--neon-purple-bright)] to-[var(--dark-text)] bg-clip-text text-transparent">HyperGit</h1>
        <p className="text-[var(--dark-text-secondary)] text-lg">Lightning fast GitHub file search</p>
      </div>

      {!showTokenInput ? (
        <div className="space-y-6">
          <p className="text-[var(--dark-text-secondary)]">Connect your GitHub account to start searching your repositories</p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleOAuthLogin}
              className="inline-flex items-center gap-3 px-8 py-4 glass-effect text-[var(--dark-text)] rounded-xl neon-glow-hover transition-all duration-300 transform hover:scale-105 border border-[var(--neon-purple)]/30"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
            <button
              onClick={() => setShowTokenInput(true)}
              className="text-sm text-[var(--dark-text-secondary)] hover:text-[var(--neon-purple)] transition-colors duration-200 underline underline-offset-2"
            >
              Use Personal Access Token instead
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-left space-y-2">
            <label className="block text-sm font-medium text-[var(--dark-text)]">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveToken()}
              placeholder="ghp_xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 shiny-surface text-[var(--dark-text)] rounded-lg focus:outline-none focus:border-[var(--neon-purple)] focus:neon-glow transition-all duration-200 placeholder-[var(--dark-text-secondary)]"
              autoFocus
            />
            <p className="text-xs text-[var(--dark-text-secondary)]">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
              >
                github.com/settings/tokens
              </a>
              {' '}with &apos;repo&apos; scope
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveToken}
              disabled={!token.trim() || loading}
              className="flex-1 px-4 py-3 bg-[var(--neon-purple)] text-white rounded-lg hover:bg-[var(--neon-purple-bright)] disabled:opacity-50 disabled:cursor-not-allowed neon-glow-hover transition-all duration-200"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
            <button
              onClick={() => {
                setShowTokenInput(false)
                setToken('')
              }}
              className="px-4 py-3 text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}