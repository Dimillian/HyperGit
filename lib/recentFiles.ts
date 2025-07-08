import { GitHubRepo, GitHubFile } from './github/api'

export interface RecentFile {
  file: GitHubFile
  repo: GitHubRepo
  branch: string
  timestamp: number
}

const RECENT_FILES_KEY = 'hypergit_recent_files'
const MAX_RECENT_FILES = 6

export class RecentFilesManager {
  // Get recent files from localStorage
  static getRecentFiles(): RecentFile[] {
    try {
      const stored = localStorage.getItem(RECENT_FILES_KEY)
      if (!stored) return []
      
      const files: RecentFile[] = JSON.parse(stored)
      
      // Sort by timestamp (most recent first)
      return files.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.warn('Failed to load recent files:', error)
      return []
    }
  }

  // Add a file to recent files
  static addRecentFile(repo: GitHubRepo, file: GitHubFile, branch: string = repo.default_branch): void {
    try {
      const currentFiles = this.getRecentFiles()
      
      // Remove existing entry for this file+branch combination if it exists
      const filteredFiles = currentFiles.filter(
        item => !(item.file.path === file.path && item.repo.full_name === repo.full_name && item.branch === branch)
      )
      
      // Add new entry at the beginning
      const newRecentFile: RecentFile = {
        file,
        repo,
        branch,
        timestamp: Date.now()
      }
      
      const updatedFiles = [newRecentFile, ...filteredFiles].slice(0, MAX_RECENT_FILES)
      
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles))
    } catch (error) {
      console.warn('Failed to save recent file:', error)
    }
  }

  // Clear all recent files
  static clearRecentFiles(): void {
    try {
      localStorage.removeItem(RECENT_FILES_KEY)
    } catch (error) {
      console.warn('Failed to clear recent files:', error)
    }
  }

  // Remove a specific recent file
  static removeRecentFile(repo: GitHubRepo, file: GitHubFile, branch: string = repo.default_branch): void {
    try {
      const currentFiles = this.getRecentFiles()
      const filteredFiles = currentFiles.filter(
        item => !(item.file.path === file.path && item.repo.full_name === repo.full_name && item.branch === branch)
      )
      
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(filteredFiles))
    } catch (error) {
      console.warn('Failed to remove recent file:', error)
    }
  }
}