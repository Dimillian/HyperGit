export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  sha: string
  download_url?: string
}

export interface GitHubRepo {
  name: string
  full_name: string
  description: string
  html_url: string
  default_branch: string
  language: string
  updated_at: string
}

export interface GitHubFileContent {
  content: string
  encoding: 'base64' | 'utf-8'
  size: number
  name: string
  path: string
  sha: string
}

export class GitHubAPI {
  private token: string
  private baseUrl = 'https://api.github.com'

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HyperGit-App'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GitHub API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  // Parse GitHub URL to extract owner and repo
  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/,
      /github\.com\/([^\/]+)\/([^\/]+)$/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        }
      }
    }
    
    return null
  }

  // Get repository information
  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`)
  }

  // Get repository contents (files and directories)
  async getRepositoryContents(
    owner: string, 
    repo: string, 
    path: string = '',
    ref?: string
  ): Promise<GitHubFile[]> {
    let endpoint = `/repos/${owner}/${repo}/contents/${path}`
    if (ref) {
      endpoint += `?ref=${ref}`
    }
    
    const result = await this.request<GitHubFile | GitHubFile[]>(endpoint)
    return Array.isArray(result) ? result : [result]
  }

  // Get file content
  async getFileContent(
    owner: string, 
    repo: string, 
    path: string,
    ref?: string
  ): Promise<GitHubFileContent> {
    let endpoint = `/repos/${owner}/${repo}/contents/${path}`
    if (ref) {
      endpoint += `?ref=${ref}`
    }
    
    const result = await this.request<GitHubFileContent>(endpoint)
    
    // Decode base64 content if needed
    if (result.encoding === 'base64') {
      result.content = atob(result.content.replace(/\n/g, ''))
    }
    
    return result
  }

  // Get user's repositories
  async getUserRepositories(): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>('/user/repos?sort=updated&per_page=100')
  }

  // Search repository files using GitHub's search API
  async searchRepositoryFiles(
    owner: string, 
    repo: string, 
    query: string,
    ref?: string,
    maxResults: number = 50
  ): Promise<GitHubFile[]> {
    try {
      const searchQuery = `repo:${owner}/${repo} filename:${query}`
      const response = await this.request<{
        items: Array<{
          name: string
          path: string
          sha: string
          size: number
          html_url: string
        }>
      }>(`/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${Math.min(maxResults, 100)}`)
      
      return response.items.map(item => ({
        name: item.name,
        path: item.path,
        type: 'file' as const,
        size: item.size,
        sha: item.sha,
        download_url: item.html_url.replace('/blob/', '/raw/')
      }))
    } catch (error) {
      console.warn('GitHub search API failed, falling back to recursive search:', error)
      return this.recursiveSearchFiles(owner, repo, query, ref, '', maxResults)
    }
  }

  // Optimized recursive search as fallback
  private async recursiveSearchFiles(
    owner: string, 
    repo: string, 
    query: string,
    ref?: string,
    path: string = '',
    maxResults: number = 50,
    currentResults: GitHubFile[] = []
  ): Promise<GitHubFile[]> {
    if (currentResults.length >= maxResults) {
      return currentResults
    }

    try {
      const contents = await this.getRepositoryContents(owner, repo, path, ref)
      const lowerQuery = query.toLowerCase()
      
      for (const item of contents) {
        if (currentResults.length >= maxResults) break
        
        if (item.type === 'file') {
          const matchesName = item.name.toLowerCase().includes(lowerQuery)
          const matchesPath = item.path.toLowerCase().includes(lowerQuery)
          
          if (query === '' || matchesName || matchesPath) {
            currentResults.push(item)
          }
        }
      }
      
      for (const item of contents) {
        if (currentResults.length >= maxResults) break
        
        if (item.type === 'dir') {
          await this.recursiveSearchFiles(
            owner, repo, query, ref, item.path, maxResults, currentResults
          )
        }
      }
    } catch (error) {
      console.warn(`Failed to search directory ${path}:`, error)
    }
    
    return currentResults
  }
}

// Utility function to get file extension for syntax highlighting
export function getFileLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'swift': 'swift',
    'kt': 'kotlin',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'sh': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sql': 'sql',
    'md': 'markdown',
    'dockerfile': 'dockerfile'
  }
  
  return languageMap[ext || ''] || 'text'
}