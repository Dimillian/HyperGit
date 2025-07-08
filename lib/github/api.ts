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
  pushed_at: string
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
  lastCommitDate?: string
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

  // Get repository branches sorted by most recent activity
  async getRepositoryBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    try {
      // Get all branches with commit details
      const branches = await this.request<Array<{
        name: string
        commit: {
          sha: string
          url: string
        }
        protected: boolean
      }>>(`/repos/${owner}/${repo}/branches?per_page=100`)
      
      // Get the repository info to identify the default branch
      const repoInfo = await this.getRepository(owner, repo)
      const defaultBranch = repoInfo.default_branch
      
      // Fetch commit details for each branch to get the actual commit date
      const branchesWithDates = await Promise.all(
        branches.map(async (branch) => {
          try {
            // Fetch the commit details for this branch's HEAD
            const commit = await this.request<{
              commit: {
                author: {
                  date: string
                }
                committer: {
                  date: string
                }
              }
            }>(`/repos/${owner}/${repo}/commits/${branch.commit.sha}`)
            
            return {
              ...branch,
              lastCommitDate: commit.commit.author.date
            } as GitHubBranch
          } catch (error) {
            console.warn(`Failed to fetch commit date for branch ${branch.name}:`, error)
            return {
              ...branch,
              lastCommitDate: undefined
            } as GitHubBranch
          }
        })
      )
      
      // Sort branches by most recent commit date
      return branchesWithDates.sort((a, b) => {
        // Default branch always comes first
        if (a.name === defaultBranch) return -1
        if (b.name === defaultBranch) return 1
        
        // Get commit dates for comparison
        const dateA = a.lastCommitDate
        const dateB = b.lastCommitDate
        
        // If we have dates for both, sort by most recent
        if (dateA && dateB) {
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        }
        
        // If only one has a date, prioritize it
        if (dateA && !dateB) return -1
        if (!dateA && dateB) return 1
        
        // If neither has a date, sort alphabetically
        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      console.error('Failed to fetch repository branches:', error)
      return []
    }
  }

  // Get complete repository file tree using Git Trees API
  async getRepositoryTree(owner: string, repo: string, branch?: string): Promise<GitHubFile[]> {
    try {
      // Get the repository info to find the default branch if none specified
      const repoInfo = await this.getRepository(owner, repo)
      const targetBranch = branch || repoInfo.default_branch

      // Get the branch reference
      const branchRef = await this.request<{
        object: { sha: string }
      }>(`/repos/${owner}/${repo}/git/refs/heads/${targetBranch}`)

      // Get the tree recursively
      const tree = await this.request<{
        tree: Array<{
          path: string
          type: string
          sha: string
          size?: number
        }>
      }>(`/repos/${owner}/${repo}/git/trees/${branchRef.object.sha}?recursive=1`)

      // Convert tree items to GitHubFile format, filtering only files
      return tree.tree
        .filter(item => item.type === 'blob') // 'blob' means file in git
        .map(item => ({
          name: item.path.split('/').pop() || item.path,
          path: item.path,
          type: 'file' as const,
          size: item.size,
          sha: item.sha,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${targetBranch}/${item.path}`
        }))
    } catch (error) {
      console.error('Error fetching repository tree:', error)
      throw error
    }
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

  // Get user's repositories with optional progress callback
  async getUserRepositories(onProgress?: (loaded: number, total: number) => void): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = []
    let page = 1
    const perPage = 100
    
    while (true) {
      const repos = await this.request<GitHubRepo[]>(`/user/repos?sort=updated&per_page=${perPage}&page=${page}`)
      
      if (repos.length === 0) {
        break
      }
      
      allRepos.push(...repos)
      
      // Report progress - use 0 for total to indicate unknown
      if (onProgress) {
        onProgress(allRepos.length, 0)
      }
      
      // If we got less than perPage, we've reached the end
      if (repos.length < perPage) {
        break
      }
      
      page++
    }
    
    // Sort all repositories by most recently pushed to (actual activity)
    // This is necessary because pagination breaks the sort order across pages
    return allRepos.sort((a, b) => {
      // Use pushed_at for actual repository activity, fallback to updated_at
      const dateA = new Date(a.pushed_at || a.updated_at).getTime()
      const dateB = new Date(b.pushed_at || b.updated_at).getTime()
      return dateB - dateA // Most recent first
    })
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