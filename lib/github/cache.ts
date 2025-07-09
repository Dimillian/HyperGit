import { GitHubFile } from './api'
import Fuse from 'fuse.js'

interface CacheEntry {
  files: GitHubFile[]
  timestamp: number
  repoFullName: string
  fuse?: Fuse<GitHubFile>
}

export class FileTreeCache {
  private cache = new Map<string, CacheEntry>()
  private maxAge = 5 * 60 * 1000 // 5 minutes
  private maxSize = 50 // Maximum number of repositories to cache

  // Get cached file tree for a repository and branch
  get(repoFullName: string, branch?: string): GitHubFile[] | null {
    const cacheKey = branch ? `${repoFullName}:${branch}` : repoFullName
    const entry = this.cache.get(cacheKey)
    
    if (!entry) {
      return null
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(cacheKey)
      return null
    }

    // Move to end (LRU)
    this.cache.delete(cacheKey)
    this.cache.set(cacheKey, entry)

    return entry.files
  }

  // Set cached file tree for a repository and branch
  set(repoFullName: string, files: GitHubFile[], branch?: string): void {
    const cacheKey = branch ? `${repoFullName}:${branch}` : repoFullName
    
    // Remove oldest entry if cache is full (LRU eviction)
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // Create Fuse instance for fuzzy search
    const fuse = new Fuse(files, {
      keys: ['name', 'path'],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true
    })

    this.cache.set(cacheKey, {
      files,
      timestamp: Date.now(),
      repoFullName: cacheKey, // Store the full cache key for consistency
      fuse
    })

    // Also save to localStorage for persistence (only for smaller repos)
    if (files.length < 5000) {
      try {
        const storageKey = `hypergit_tree_${cacheKey}`
        localStorage.setItem(storageKey, JSON.stringify({
          files: files.slice(0, 1000), // Limit stored files
          timestamp: Date.now()
        }))
        
        // Clean up old localStorage entries
        this.cleanupLocalStorage()
      } catch {
        // Ignore localStorage errors (quota exceeded, etc)
        console.warn('Failed to save to localStorage')
      }
    }
  }

  // Load from localStorage if available
  loadFromStorage(repoFullName: string, branch?: string): GitHubFile[] | null {
    try {
      const cacheKey = branch ? `${repoFullName}:${branch}` : repoFullName
      const storageKey = `hypergit_tree_${cacheKey}`
      const stored = localStorage.getItem(storageKey)
      
      if (!stored) return null

      const data = JSON.parse(stored)
      
      // Check if stored data is expired
      if (Date.now() - data.timestamp > this.maxAge) {
        localStorage.removeItem(storageKey)
        return null
      }

      return data.files
    } catch {
      return null
    }
  }

  // Clean up old localStorage entries
  private cleanupLocalStorage(): void {
    const keys = Object.keys(localStorage)
    const treeKeys = keys.filter(k => k.startsWith('hypergit_tree_'))
    
    // Keep only the 10 most recent
    if (treeKeys.length > 10) {
      const entries = treeKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          return { key, timestamp: data.timestamp || 0 }
        } catch {
          return { key, timestamp: 0 }
        }
      })

      entries.sort((a, b) => b.timestamp - a.timestamp)
      
      // Remove old entries
      entries.slice(10).forEach(entry => {
        localStorage.removeItem(entry.key)
      })
    }
  }

  // Clear cache for a specific repository and branch
  clear(repoFullName: string, branch?: string): void {
    const cacheKey = branch ? `${repoFullName}:${branch}` : repoFullName
    this.cache.delete(cacheKey)
    try {
      localStorage.removeItem(`hypergit_tree_${cacheKey}`)
    } catch {
      // Ignore
    }
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear()
    
    // Clear localStorage entries
    const keys = Object.keys(localStorage)
    keys.filter(k => k.startsWith('hypergit_tree_')).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore
      }
    })
  }

  // Search files in cached tree with fuzzy search
  searchFiles(repoFullName: string, query: string, branch?: string): GitHubFile[] {
    const cacheKey = branch ? `${repoFullName}:${branch}` : repoFullName
    const entry = this.cache.get(cacheKey)
    if (!entry || !entry.fuse) return []

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(cacheKey)
      return []
    }

    // Empty query returns all files (limited)
    if (!query.trim()) {
      return entry.files.slice(0, 100)
    }

    // Use Fuse.js for fuzzy search
    const results = entry.fuse.search(query)
    
    // Return files sorted by score (best matches first)
    return results
      .map(result => result.item)
      .slice(0, 100) // Limit results
  }

  // Get Fuse instance for a repository (for external use)
  getFuse(repoFullName: string): Fuse<GitHubFile> | null {
    const entry = this.cache.get(repoFullName)
    return entry?.fuse || null
  }
}

// Global cache instance
export const fileTreeCache = new FileTreeCache()