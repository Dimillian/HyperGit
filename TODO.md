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
- [ ] Advanced search filters (file type, date modified, size)
- [ ] Search history and recent files
- [ ] Fuzzy search improvements
- [ ] Search across multiple repositories simultaneously

### File Viewing
- [x] Syntax-highlighted file display
- [x] Copy to clipboard functionality
- [x] Direct GitHub link
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
- [ ] Dark mode support
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
- [ ] Most accessed files tracking
- [ ] Repository usage analytics
- [ ] Search pattern insights
- [ ] Time-based file access patterns

## 🐛 Bug Fixes & Polish

### Known Issues
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

---

## Update Guidelines

**IMPORTANT**: This TODO list should be updated whenever:
1. Starting work on a new feature (move to "In Progress")
2. Completing a feature (mark as done with ✅)
3. Discovering new requirements (add to appropriate section)
4. Changing priorities (move between sections)
5. Finding bugs (add to Bug Fixes section)

Last Updated: January 2025