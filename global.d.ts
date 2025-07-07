interface Window {
  searchBarRef?: {
    selectRepositoryFromCard: (repo: import('@/lib/github/api').GitHubRepo) => void
    resetSearchBar: () => void
  }
}