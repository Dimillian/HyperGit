'use client'

interface LoadingScreenProps {
  loadingProgress?: {
    loaded: number
    total: number
  }
}

export default function LoadingScreen({ loadingProgress }: LoadingScreenProps) {
  // When total is 0, we don't know the total, so show indeterminate progress
  const hasTotal = loadingProgress && loadingProgress.total > 0
  // Calculate progress but it's not currently used in rendering
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  hasTotal && loadingProgress
    ? (loadingProgress.loaded / loadingProgress.total) * 100 
    : 0
    
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #1a0d2e 0%, #0f051a 40%, var(--dark-bg) 70%)' }}>
      <div className="text-center space-y-8">
        {/* HyperGit Logo with Animation */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 text-[var(--neon-purple)] flex items-center justify-center animate-pulse">
            <svg 
              viewBox="0 0 16 16"
              className="w-full h-full"
            >
              {/* GitHub Icon */}
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" 
                    fill="currentColor"/>
              {/* Lightning Bolt with Glow Animation */}
              <path d="M10 0l-3 7h2l-2 9 4-8h-2l3-8z" 
                    fill="#fbbf24" 
                    className="animate-pulse"
                    opacity="0.95"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--dark-text)] via-[var(--neon-purple-bright)] to-[var(--dark-text)] bg-clip-text text-transparent">
            HyperGit
          </h1>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-[var(--neon-purple)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-[var(--neon-purple)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-[var(--neon-purple)] rounded-full animate-bounce"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg text-[var(--dark-text)]">
            {loadingProgress && loadingProgress.loaded > 0 ? 'Loading repositories...' : 'Initializing HyperGit...'}
          </p>
          <p className="text-sm text-[var(--dark-text-secondary)]">
            {loadingProgress && loadingProgress.loaded > 0 
              ? `${loadingProgress.loaded} repositories loaded`
              : 'Connecting to GitHub'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-[var(--dark-border)] rounded-full overflow-hidden">
            {loadingProgress && loadingProgress.loaded > 0 ? (
              // Indeterminate progress animation when we don't know the total
              <div className="h-full relative">
                <div 
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--neon-purple)] to-transparent animate-[slide_1.5s_ease-in-out_infinite]"
                />
              </div>
            ) : (
              // Static bar when initializing
              <div 
                className="h-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-purple-bright)] rounded-full"
                style={{ width: '5%' }}
              />
            )}
          </div>
          {loadingProgress && loadingProgress.loaded > 0 && (
            <p className="text-xs text-[var(--neon-purple)] mt-2">
              Loading...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}