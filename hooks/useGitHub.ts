import { useState, useEffect } from 'react'
import { GitHubAPI, GitHubRepo } from '@/lib/github/api'

export function useGitHub() {
  const [github, setGitHub] = useState<GitHubAPI | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 })

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('github_token')
      if (token) {
        setGitHub(new GitHubAPI(token))
        await loadRepositories(token)
      }
      setIsInitializing(false)
    }

    initializeAuth()

    const handleStorageChange = () => {
      const token = localStorage.getItem('github_token')
      const newToken = localStorage.getItem('github_token')
      if (newToken && newToken !== token) {
        setGitHub(new GitHubAPI(newToken))
        loadRepositories(newToken)
      } else if (!newToken && token) {
        clearToken()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadRepositories = async (token: string) => {
    setLoading(true)
    setError(null)
    setLoadingProgress({ loaded: 0, total: 0 })
    try {
      const api = new GitHubAPI(token)
      const repos = await api.getUserRepositories((loaded, total) => {
        setLoadingProgress({ loaded, total })
      })
      setRepositories(repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const setToken = (token: string) => {
    localStorage.setItem('github_token', token)
    setGitHub(new GitHubAPI(token))
    loadRepositories(token)
  }

  const clearToken = () => {
    localStorage.removeItem('github_token')
    setGitHub(null)
    setRepositories([])
  }

  return {
    github,
    repositories,
    loading,
    error,
    setToken,
    clearToken,
    isAuthenticated: !!github,
    isInitializing,
    loadingProgress
  }
}