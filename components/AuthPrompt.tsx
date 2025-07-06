'use client'

import { useState } from 'react'
import { useGitHub } from '@/hooks/useGitHub'
import { Github, Key } from 'lucide-react'

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
        <div className="relative">
          <Github className="w-20 h-20 text-[var(--neon-purple)] mx-auto neon-glow" />
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-[var(--neon-purple)] opacity-20 blur-xl"></div>
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
              {' '}with 'repo' scope
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