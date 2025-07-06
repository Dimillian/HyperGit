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
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <Github className="w-16 h-16 text-gray-400 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">HyperGit</h1>
        <p className="text-gray-600">Lightning fast GitHub file search</p>
      </div>

      {!showTokenInput ? (
        <div className="space-y-4">
          <p className="text-gray-600">Connect your GitHub account to start searching your repositories</p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleOAuthLogin}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github className="w-4 h-4" />
              Sign in with GitHub
            </button>
            <button
              onClick={() => setShowTokenInput(true)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Use Personal Access Token instead
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="text-left space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveToken()}
              placeholder="ghp_xxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                github.com/settings/tokens
              </a>
              {' '}with 'repo' scope
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveToken}
              disabled={!token.trim() || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
            <button
              onClick={() => {
                setShowTokenInput(false)
                setToken('')
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}