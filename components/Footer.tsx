export default function Footer() {
  return (
    <footer className="border-t border-[var(--dark-border)] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-[var(--dark-text-secondary)]">
            Made with ❤️ by{' '}
            <a 
              href="https://dimillian.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
            >
              @Dimillian
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--dark-text-secondary)]">
            <span>
              Powered by{' '}
              <a 
                href="https://docs.github.com/en/rest" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
              >
                GitHub API
              </a>
            </span>
            <span>•</span>
            <a 
              href="https://github.com/Dimillian/HyperGit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
            >
              View Source
            </a>
            <span>•</span>
            <a 
              href="https://github.com/Dimillian/HyperGit/blob/main/PRIVACY.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--neon-purple)] hover:text-[var(--neon-purple-bright)] transition-colors duration-200"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}