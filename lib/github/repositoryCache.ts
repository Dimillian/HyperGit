import { GitHubRepo } from './api'

interface CachedRepositoryData {
  repositories: GitHubRepo[]
  timestamp: number
  token: string
}

class RepositoryCache {
  private readonly CACHE_KEY = 'hypergit_repositories'
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  /**
   * Get cached repositories if they exist and are still valid
   */
  get(token: string): GitHubRepo[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null

      const data: CachedRepositoryData = JSON.parse(cached)
      
      // Check if cache is for the same token
      if (data.token !== token) {
        this.clear()
        return null
      }

      // Check if cache is still valid
      const now = Date.now()
      if (now - data.timestamp > this.CACHE_DURATION) {
        this.clear()
        return null
      }

      return data.repositories
    } catch (error) {
      console.error('Error reading repository cache:', error)
      this.clear()
      return null
    }
  }

  /**
   * Cache repositories with current timestamp
   */
  set(repositories: GitHubRepo[], token: string): void {
    const data: CachedRepositoryData = {
      repositories,
      timestamp: Date.now(),
      token
    }
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching repositories:', error)
      // If localStorage is full, try to clear old cache and retry
      this.clear()
      try {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(data))
      } catch (retryError) {
        console.error('Failed to cache repositories after cleanup:', retryError)
      }
    }
  }

  /**
   * Clear cached repositories
   */
  clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY)
    } catch (error) {
      console.error('Error clearing repository cache:', error)
    }
  }

  /**
   * Check if we have valid cached repositories
   */
  hasValidCache(token: string): boolean {
    return this.get(token) !== null
  }

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(token: string): number | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null

      const data: CachedRepositoryData = JSON.parse(cached)
      
      if (data.token !== token) return null

      return Date.now() - data.timestamp
    } catch {
      return null
    }
  }
}

export const repositoryCache = new RepositoryCache()