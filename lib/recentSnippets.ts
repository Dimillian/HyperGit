import { GitHubRepo, GitHubFile } from './github/api'

export interface RecentSnippet {
  id: string
  file: GitHubFile
  repo: GitHubRepo
  branch: string
  selectedLines: { start: number; end: number }
  code: string
  language: string
  title: string
  timestamp: number
}

const RECENT_SNIPPETS_KEY = 'hypergit_recent_snippets'
const MAX_RECENT_SNIPPETS = 12

export class RecentSnippetsManager {
  // Get recent snippets from localStorage
  static getRecentSnippets(): RecentSnippet[] {
    try {
      const stored = localStorage.getItem(RECENT_SNIPPETS_KEY)
      if (!stored) return []
      
      const snippets: RecentSnippet[] = JSON.parse(stored)
      
      // Sort by timestamp (most recent first)
      return snippets.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.warn('Failed to load recent snippets:', error)
      return []
    }
  }

  // Add a snippet to recent snippets
  static addRecentSnippet(
    repo: GitHubRepo, 
    file: GitHubFile, 
    branch: string,
    selectedLines: { start: number; end: number },
    code: string,
    language: string,
    title?: string
  ): void {
    try {
      const currentSnippets = this.getRecentSnippets()
      
      // Generate a unique ID for this snippet
      const id = `${repo.full_name}-${file.path}-${branch}-${selectedLines.start}-${selectedLines.end}-${Date.now()}`
      
      // Generate a title if not provided
      const snippetTitle = title || this.generateSnippetTitle(file, selectedLines, code)
      
      // Create new snippet
      const newSnippet: RecentSnippet = {
        id,
        file,
        repo,
        branch,
        selectedLines,
        code,
        language,
        title: snippetTitle,
        timestamp: Date.now()
      }
      
      // Add to beginning and limit total count
      const updatedSnippets = [newSnippet, ...currentSnippets].slice(0, MAX_RECENT_SNIPPETS)
      
      localStorage.setItem(RECENT_SNIPPETS_KEY, JSON.stringify(updatedSnippets))
    } catch (error) {
      console.warn('Failed to save recent snippet:', error)
    }
  }

  // Generate a smart title for the snippet
  static generateSnippetTitle(
    file: GitHubFile, 
    selectedLines: { start: number; end: number }, 
    code: string
  ): string {
    // Try to extract a meaningful title from the code
    const firstLine = code.split('\n')[0].trim()
    
    // Common patterns to look for
    const patterns = [
      // Function definitions
      /(?:function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
      /(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/,
      // Comments
      /\/\/\s*(.+)/,
      /\/\*\s*(.+)\s*\*\//,
      /#\s*(.+)/,
    ]
    
    for (const pattern of patterns) {
      const match = firstLine.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    // Fallback to file name and line numbers
    const lineRange = selectedLines.start === selectedLines.end 
      ? `L${selectedLines.start}` 
      : `L${selectedLines.start}-${selectedLines.end}`
    
    return `${file.name} ${lineRange}`
  }

  // Remove a specific snippet
  static removeRecentSnippet(snippetId: string): void {
    try {
      const currentSnippets = this.getRecentSnippets()
      const filteredSnippets = currentSnippets.filter(snippet => snippet.id !== snippetId)
      
      localStorage.setItem(RECENT_SNIPPETS_KEY, JSON.stringify(filteredSnippets))
    } catch (error) {
      console.warn('Failed to remove recent snippet:', error)
    }
  }

  // Clear all recent snippets
  static clearRecentSnippets(): void {
    try {
      localStorage.removeItem(RECENT_SNIPPETS_KEY)
    } catch (error) {
      console.warn('Failed to clear recent snippets:', error)
    }
  }

  // Update snippet title
  static updateSnippetTitle(snippetId: string, newTitle: string): void {
    try {
      const currentSnippets = this.getRecentSnippets()
      const updatedSnippets = currentSnippets.map(snippet => 
        snippet.id === snippetId 
          ? { ...snippet, title: newTitle }
          : snippet
      )
      
      localStorage.setItem(RECENT_SNIPPETS_KEY, JSON.stringify(updatedSnippets))
    } catch (error) {
      console.warn('Failed to update snippet title:', error)
    }
  }
}