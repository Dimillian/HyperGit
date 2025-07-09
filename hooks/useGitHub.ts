import { useState, useEffect } from 'react'
import { GitHubAPI, GitHubRepo } from '@/lib/github/api'
import { repositoryCache } from '@/lib/github/repositoryCache'

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
        
        // Try to load from cache first
        const cachedRepos = repositoryCache.get(token)
        if (cachedRepos) {
          setRepositories(cachedRepos)
          setIsInitializing(false)
          
          // Load fresh data in background
          loadRepositories(token, true)
        } else {
          // No cache, load normally
          await loadRepositories(token)
          setIsInitializing(false)
        }
      } else {
        setIsInitializing(false)
      }
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

  const loadRepositories = async (token: string, isBackground = false) => {
    if (!isBackground) {
      setLoading(true)
      setError(null)
      setLoadingProgress({ loaded: 0, total: 0 })
    }
    
    try {
      const api = new GitHubAPI(token)
      const repos = await api.getUserRepositories((loaded, total) => {
        if (!isBackground) {
          setLoadingProgress({ loaded, total })
        }
      })
      
      setRepositories(repos)
      
      // Cache the repositories
      repositoryCache.set(repos, token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }

  const setToken = (token: string) => {
    localStorage.setItem('github_token', token)
    setGitHub(new GitHubAPI(token))
    loadRepositories(token)
  }

  const clearToken = () => {
    localStorage.removeItem('github_token')
    repositoryCache.clear()
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