'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { GitHubFile } from '@/lib/github/api'

interface FileTreeProps {
  files: GitHubFile[]
  selectedFile: GitHubFile | null
  onFileSelect: (file: GitHubFile) => void
}

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: TreeNode[]
  file?: GitHubFile
}

function buildTree(files: GitHubFile[]): TreeNode[] {
  const root: TreeNode[] = []
  const pathMap = new Map<string, TreeNode>()

  // Sort files by path to ensure parents are created before children
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

  sortedFiles.forEach(file => {
    const parts = file.path.split('/')
    let currentPath = ''
    let currentLevel = root

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFile = index === parts.length - 1

      if (!pathMap.has(currentPath)) {
        const node: TreeNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'dir',
          children: isFile ? undefined : [],
          file: isFile ? file : undefined
        }

        pathMap.set(currentPath, node)
        currentLevel.push(node)
      }

      if (!isFile) {
        currentLevel = pathMap.get(currentPath)!.children!
      }
    })
  })

  // Sort each level: folders first (alphabetically), then files (alphabetically)
  const sortLevel = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      // If different types, directories come first
      if (a.type !== b.type) {
        return a.type === 'dir' ? -1 : 1
      }
      // If same type, sort alphabetically
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    })

    // Recursively sort children
    nodes.forEach(node => {
      if (node.children) {
        sortLevel(node.children)
      }
    })
  }

  sortLevel(root)
  return root
}

interface TreeItemProps {
  node: TreeNode
  level: number
  selectedFile: GitHubFile | null
  onFileSelect: (file: GitHubFile) => void
  expandedPaths: Set<string>
  onToggleExpand: (path: string) => void
}

function TreeItem({ node, level, selectedFile, onFileSelect, expandedPaths, onToggleExpand }: TreeItemProps) {
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedFile?.path === node.path
  const Icon = node.type === 'dir' ? Folder : File
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

  const handleClick = () => {
    if (node.type === 'dir') {
      onToggleExpand(node.path)
    } else if (node.file) {
      onFileSelect(node.file)
    }
  }

  return (
    <>
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-[var(--neon-purple)]/10 transition-colors
          ${isSelected ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple)]' : 'text-[var(--dark-text)]'}
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'dir' && (
          <ChevronIcon className="w-4 h-4 flex-shrink-0" />
        )}
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate text-sm">{node.name}</span>
      </div>
      {node.type === 'dir' && isExpanded && node.children && (
        <>
          {node.children.map(child => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </>
      )}
    </>
  )
}

export default function FileTree({ files, selectedFile, onFileSelect }: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  
  const tree = useMemo(() => buildTree(files), [files])

  const handleToggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  return (
    <div className="py-2">
      {tree.map(node => (
        <TreeItem
          key={node.path}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          expandedPaths={expandedPaths}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  )
}