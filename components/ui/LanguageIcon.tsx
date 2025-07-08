'use client'

import { Code, File } from 'lucide-react'
import * as SimpleIcons from 'simple-icons'

interface LanguageIconProps {
  language?: string | null
  filename?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LanguageIcon({ language, filename, size = 'md', className = '' }: LanguageIconProps) {
  const getIconPath = (iconName: string): string | null => {
    const icon = (SimpleIcons as any)[iconName]
    return icon?.path || null
  }

  // Determine language from filename if not provided
  const getLanguageFromFilename = (filename: string): string | null => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext) return null

    const extToLanguage: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'swift': 'swift',
      'kt': 'kotlin',
      'java': 'java',
      'cpp': 'c++',
      'c': 'c',
      'cs': 'c#',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'vue': 'vue',
      'svelte': 'svelte',
      'dart': 'dart',
      'dockerfile': 'dockerfile',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
    }

    return extToLanguage[ext] || null
  }

  const finalLanguage = language || (filename ? getLanguageFromFilename(filename) : null)
  
  const iconMap: Record<string, { name: string; color: string }> = {
    'javascript': { name: 'siJavascript', color: '#F7DF1E' },
    'typescript': { name: 'siTypescript', color: '#3178C6' },
    'python': { name: 'siPython', color: '#3776AB' },
    'swift': { name: 'siSwift', color: '#F05138' },
    'kotlin': { name: 'siKotlin', color: '#7F52FF' },
    'java': { name: 'siOpenjdk', color: '#ED8B00' },
    'c++': { name: 'siCplusplus', color: '#00599C' },
    'c': { name: 'siC', color: '#A8B9CC' },
    'c#': { name: 'siCsharp', color: '#239120' },
    'ruby': { name: 'siRuby', color: '#CC342D' },
    'go': { name: 'siGo', color: '#00ADD8' },
    'rust': { name: 'siRust', color: '#000000' },
    'php': { name: 'siPhp', color: '#777BB4' },
    'html': { name: 'siHtml5', color: '#E34F26' },
    'css': { name: 'siCss3', color: '#1572B6' },
    'scss': { name: 'siSass', color: '#CC6699' },
    'vue': { name: 'siVuedotjs', color: '#4FC08D' },
    'svelte': { name: 'siSvelte', color: '#FF3E00' },
    'dart': { name: 'siDart', color: '#0175C2' },
    'shell': { name: 'siGnubash', color: '#4EAA25' },
    'dockerfile': { name: 'siDocker', color: '#2496ED' },
    'objective-c': { name: 'siApple', color: '#000000' },
    'scala': { name: 'siScala', color: '#DC322F' },
    'r': { name: 'siR', color: '#276DC3' },
    'lua': { name: 'siLua', color: '#2C2D72' },
    'perl': { name: 'siPerl', color: '#39457E' },
    'haskell': { name: 'siHaskell', color: '#5E5086' },
    'clojure': { name: 'siClojure', color: '#5881D8' },
    'elixir': { name: 'siElixir', color: '#4B275F' },
    'erlang': { name: 'siErlang', color: '#A90533' },
    'json': { name: 'siJson', color: '#000000' },
    'yaml': { name: 'siYaml', color: '#CB171E' },
    'markdown': { name: 'siMarkdown', color: '#000000' },
  }

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const responsiveSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4 sm:w-3 sm:h-3',
    lg: 'w-6 h-6 sm:w-5 sm:h-5'
  }

  if (!finalLanguage) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-400 rounded-sm ${className}`} />
    )
  }

  const normalizedLang = finalLanguage.toLowerCase()
  const iconInfo = iconMap[normalizedLang]
  
  if (!iconInfo) {
    return (
      <Code className={`${sizeClasses[size]} ${className}`} style={{ color: '#888' }} />
    )
  }

  const iconPath = getIconPath(iconInfo.name)
  if (!iconPath) {
    return (
      <File className={`${sizeClasses[size]} ${className}`} style={{ color: '#888' }} />
    )
  }

  return (
    <svg
      className={`${responsiveSizeClasses[size]} ${className}`}
      viewBox="0 0 24 24"
      fill={iconInfo.color}
    >
      <path d={iconPath} />
    </svg>
  )
}