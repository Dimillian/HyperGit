interface Window {
  searchBarRef?: {
    selectRepositoryFromCard: (repo: import('@/lib/github/api').GitHubRepo) => void
    resetSearchBar: () => void
    setSearchQuery: (query: string) => Promise<void>
    inputRef?: React.RefObject<HTMLInputElement | null>
  }
}