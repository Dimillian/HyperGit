import { GitHubFile } from '@/lib/github/api'

// Helper function to get files and folders for a specific path
export const getItemsForPath = (allFiles: GitHubFile[], path: string): GitHubFile[] => {
  const folders = new Set<string>()
  const items: GitHubFile[] = []
  
  allFiles.forEach(file => {
    // Skip if not in current path
    if (path && !file.path.startsWith(path + '/')) return
    
    if (!path && file.path.includes('/') && !file.path.startsWith('/')) {
      // Root level - check for folders
      const firstSlash = file.path.indexOf('/')
      if (firstSlash > 0) {
        const folderName = file.path.substring(0, firstSlash)
        if (!folders.has(folderName)) {
          folders.add(folderName)
          items.push(createFolderItem(folderName, folderName))
        }
      }
    } else {
      // Deeper level
      const relativePath = path ? file.path.substring(path.length + 1) : file.path
      const firstSlash = relativePath.indexOf('/')
      
      if (firstSlash === -1) {
        // It's a file in current directory
        items.push(file)
      } else if (firstSlash > 0) {
        // It's a folder
        const folderName = relativePath.substring(0, firstSlash)
        const fullFolderPath = path ? `${path}/${folderName}` : folderName
        if (!folders.has(fullFolderPath)) {
          folders.add(fullFolderPath)
          items.push(createFolderItem(folderName, fullFolderPath))
        }
      }
    }
  })
  
  // Sort folders first, then files
  return items.sort((a, b) => {
    if (a.type === 'dir' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'dir') return 1
    return a.name.localeCompare(b.name)
  })
}

const createFolderItem = (name: string, path: string): GitHubFile => ({
  name,
  path,
  type: 'dir' as const,
  sha: '',
  size: 0
})

// Parse the @ mention query with branch support
export const parseQuery = (input: string) => {
  const atIndex = input.lastIndexOf('@')
  if (atIndex === -1) return { beforeAt: input, afterAt: '', repoName: '', branch: '', filePath: '' }
  
  const beforeAt = input.substring(0, atIndex)
  const afterAt = input.substring(atIndex + 1)
  
  // Parse branch syntax: repo-name:branch-name/file-path
  const colonIndex = afterAt.indexOf(':')
  const slashIndex = afterAt.indexOf('/')
  
  let repoName = ''
  let branch = ''
  let filePath = ''
  
  if (colonIndex > 0 && (slashIndex === -1 || colonIndex < slashIndex)) {
    // Branch syntax detected
    repoName = afterAt.substring(0, colonIndex)
    const afterColon = afterAt.substring(colonIndex + 1)
    const branchSlashIndex = afterColon.indexOf('/')
    
    if (branchSlashIndex === -1) {
      branch = afterColon
      filePath = ''
    } else {
      branch = afterColon.substring(0, branchSlashIndex)
      filePath = afterColon.substring(branchSlashIndex + 1)
    }
  } else {
    // Standard syntax: repo-name/file-path
    if (slashIndex === -1) {
      repoName = afterAt
      filePath = ''
    } else {
      repoName = afterAt.substring(0, slashIndex)
      filePath = afterAt.substring(slashIndex + 1)
    }
  }
  
  return {
    beforeAt,
    afterAt,
    repoName,
    branch,
    filePath
  }
}