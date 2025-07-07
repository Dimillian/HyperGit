# HyperGit TODO List

## 🚀 High Priority - Core Features

### Authentication & Security
- [x] GitHub Personal Access Token authentication
- [x] Token storage in localStorage
- [x] Token validation and error handling
- [x] GitHub OAuth flow (alternative to personal tokens)
- [ ] Add token expiration detection and refresh prompts
- [ ] Add token scope validation (ensure 'repo' scope is present)
- [ ] Add secure token storage options (consider encrypted storage)

### Search & Navigation
- [x] Basic @-mention search interface
- [x] Repository filtering and selection
- [x] File search within repositories
- [x] Keyboard navigation (arrow keys, enter, escape)
- [x] Auto-populate search bar when clicking repository cards
- [x] Search history and recent files (Recently Browsed Files section)
- [x] Fuzzy search improvements (integrated Fuse.js)
- [x] Auto-scroll on keyboard navigation
- [ ] Advanced search filters (file type, date modified, size)
- [ ] Search across multiple repositories simultaneously

### File Viewing
- [x] Syntax-highlighted file display
- [x] Copy to clipboard functionality
- [x] Direct GitHub link
- [x] Escape key support to close file viewer
- [ ] Line number jumping (URL fragments like #L123)
- [ ] File download capability
- [ ] Print-friendly view
- [ ] Image file preview support
- [ ] Binary file handling

## 🎨 Medium Priority - UI/UX Enhancements

### Interface Polish
- [x] Beautiful, minimal design
- [x] Responsive layout
- [x] Loading states
- [x] Dark mode support (dark theme with neon purple accents)
- [x] Custom branding (HyperGit logo with GitHub + lightning bolt)
- [x] Professional language icons (using Simple Icons)
- [x] Section headers for Recent Repositories and Recent Files
- [x] Footer with credits and links
- [ ] Keyboard shortcuts help modal
- [ ] Better empty states and onboarding
- [ ] Accessibility improvements (ARIA labels, focus management)
- [ ] Mobile-optimized touch interactions

### Performance
- [x] Search result caching (implemented with FileTreeCache)
- [x] Repository data caching (using LRU cache + localStorage)
- [x] Fast local search with Fuse.js fuzzy matching
- [x] GitHub Trees API for efficient file tree loading
- [x] Debounced search optimization (reduced to 100ms)
- [x] Recently browsed files cache (localStorage with timestamps)
- [x] Pagination for repository listing (fetches all pages)
- [ ] Lazy loading for large file lists
- [ ] Virtual scrolling for long search results
- [ ] Background repository syncing

## 🔧 Low Priority - Advanced Features

### Power User Features
- [ ] Multiple GitHub account support
- [ ] Organization repository access
- [ ] Branch/tag switching
- [ ] File editing capabilities (if write permissions)
- [ ] Bulk file operations
- [ ] Export search results
- [ ] Integration with VS Code (open file in editor)

### Collaboration
- [ ] Share file links with line highlighting
- [ ] Create GitHub gists from file selections
- [ ] Comment on files (via GitHub API)
- [ ] File comparison tool

### Analytics & Insights
- [x] Vercel Analytics integration
- [ ] Most accessed files tracking
- [ ] Repository usage analytics
- [ ] Search pattern insights
- [ ] Time-based file access patterns

## 🐛 Bug Fixes & Polish

### Known Issues
- [x] Fixed hydration errors with browser extensions (suppressHydrationWarning)
- [x] Fixed syntax highlighter line outline issues
- [x] Fixed search dropdown content alignment
- [x] Fixed shimmer placeholder colors for dark theme
- [ ] Handle rate limiting gracefully
- [ ] Improve error messages for network failures
- [ ] Handle very large files (>1MB)
- [ ] Fix search dropdown positioning on small screens
- [ ] Optimize bundle size

### Technical Debt
- [ ] Add comprehensive TypeScript types
- [ ] Add unit tests for core functionality
- [ ] Add end-to-end tests
- [ ] Code splitting and optimization
- [ ] SEO optimization
- [ ] Add proper error boundaries

## 🚀 Future Enhancements

### GitHub Integration
- [x] GitHub OAuth flow (alternative to personal tokens)
- [ ] GitHub Apps integration
- [ ] Webhook support for real-time updates
- [ ] GitHub Actions integration

### Extended Platform Support
- [ ] GitLab support
- [ ] Bitbucket support
- [ ] Self-hosted Git repository support
- [ ] Local repository browsing

