'use client'

import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  repositoryName: string
  currentPath: string
  onNavigate: (path: string) => void
}

export default function Breadcrumb({ repositoryName, currentPath, onNavigate }: BreadcrumbProps) {
  // Split the path into segments
  const segments = currentPath.split('/').filter(Boolean)
  
  // Calculate if we need to truncate (for responsive design)
  const shouldTruncate = segments.length > 3
  
  // Build breadcrumb items
  const breadcrumbItems = []
  
  // Always show repository
  breadcrumbItems.push({
    label: repositoryName,
    path: '',
    isClickable: segments.length > 0
  })
  
  if (shouldTruncate && segments.length > 3) {
    // Show first segment
    breadcrumbItems.push({
      label: segments[0],
      path: segments[0],
      isClickable: true
    })
    
    // Show ellipsis
    breadcrumbItems.push({
      label: '...',
      path: '',
      isClickable: false
    })
    
    // Show last two segments
    const lastTwo = segments.slice(-2)
    lastTwo.forEach((segment, index) => {
      const fullPath = segments.slice(0, segments.length - 2 + index + 1).join('/')
      const isLast = index === lastTwo.length - 1
      breadcrumbItems.push({
        label: segment,
        path: fullPath,
        isClickable: !isLast
      })
    })
  } else {
    // Show all segments
    segments.forEach((segment, index) => {
      const path = segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1
      breadcrumbItems.push({
        label: segment,
        path,
        isClickable: !isLast
      })
    })
  }
  
  return (
    <div className="flex items-center px-4 py-2 border-b border-gray-800 overflow-x-auto">
      <nav className="flex items-center space-x-1 text-sm whitespace-nowrap">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-600" />
            )}
            {item.isClickable ? (
              <button
                onClick={() => onNavigate(item.path)}
                className="text-gray-400 hover:text-white transition-colors px-1 py-0.5 rounded hover:bg-gray-800"
              >
                {item.label}
              </button>
            ) : (
              <span className={`px-1 py-0.5 ${item.label === '...' ? 'text-gray-600' : 'text-white'}`}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}