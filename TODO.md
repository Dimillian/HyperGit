# HyperGit TODO List

## 🎉 Recent Accomplishments

### Major Features Added (Latest Session)
- ✅ **Branch/Tag Switching**: Complete branch switching with syntax `@repo:branch/file` and autocomplete
- ✅ **Branch Autocomplete**: Type `:` after repo name to see and select available branches with commit dates
- ✅ **Branch-Aware Caching**: Separate file tree cache for each branch
- ✅ **Branch-Aware Recent Files**: Track files per branch, allowing multiple entries for same file on different branches
- ✅ **Recent Code Snippets**: Save, view, and manage code snippets with syntax highlighting and screenshot generation
- ✅ **Repository Sorting**: Fixed repository sorting to use `pushed_at` for accurate activity-based ordering
- ✅ **Repository Card UI**: Enhanced layout with footer alignment and date pastilles with relative time
- ✅ **Folder Browsing**: Complete repository folder navigation with breadcrumb support
- ✅ **Component Refactoring**: Reduced SearchBar complexity from 538 to 307 lines (~43% reduction)
- ✅ **Modular Architecture**: Extracted hooks, components, and utilities for better maintainability
- ✅ **Code Snippet Sharing**: Line selection + beautiful screenshot generation for social media
- ✅ **Bug Fixes**: Fixed dropdown visibility, search bar reset, and component complexity issues
- ✅ **Enhanced UX**: Improved keyboard navigation with folder support and escape key handling
- ✅ **Mobile Responsiveness**: Complete mobile optimization with proper touch targets and responsive layouts
- ✅ **Card Component Architecture**: Organized card components into modular structure with shared UI components
- ✅ **Interactive Shine Effects**: Mouse-following shine effects on cards for enhanced user experience
- ✅ **Footer Refactoring**: Created reusable Footer component for both auth and main pages
- ✅ **File Browser Implementation**: Full-featured IDE-style file browser with sidebar tree view and file preview
- ✅ **Breadcrumb Navigation**: Added breadcrumb navigation to FileBrowser for easy path navigation
- ✅ **File Tree Navigation**: Recursive tree component with expand/collapse functionality for folders
- ✅ **Integrated File Preview**: Reused existing FileViewer logic for syntax highlighting and snippet features
- ✅ **Folder Button Integration**: Added folder browse button to SearchBar when repository is selected

### Code Quality Improvements
- ✅ Created reusable hooks: `useDropdownVisibility`, `useKeyboardNavigation`
- ✅ Extracted UI components: `RepositoryDropdown`, `FileDropdown`, `BranchDropdown`, `CodeSnippetShare`, `SnippetViewer`, `RecentSnippets`
- ✅ Added utility functions: `folderUtils.ts` with branch-aware parsing and navigation helpers
- ✅ Enhanced FileViewer with line selection, sharing capabilities, snippet saving, and branch-aware file loading
- ✅ Created snippet management system: `recentSnippets.ts` with smart title generation and branch tracking
- ✅ Updated RecentFiles system with branch tracking and display
- ✅ Improved repository card layout with flexbox and proper footer alignment
- ✅ Added relative time formatting for repository cards and branch lists
- ✅ Enhanced GitHub API with `pushed_at` field and proper repository sorting
- ✅ Improved TypeScript types and interfaces (added GitHubBranch type, updated RecentFile interface, added RecentSnippet interface)
- ✅ Better separation of concerns and maintainability
- ✅ Branch-specific API integration in GitHubAPI class
- ✅ **Card Component Organization**: Organized all card-related components into `/components/Card/` folder structure
- ✅ **Shared UI Components**: Created reusable components (`LanguageIcon`, `CardActions`, `FilePathDisplay`, `ShineCard`, `TimePill`)
- ✅ **Mobile-First Design**: Implemented responsive design with proper touch targets (44px minimum) and mobile-optimized layouts
- ✅ **Component Consolidation**: Reduced code duplication by ~200 lines through shared component extraction
- ✅ **Footer Component**: Extracted footer into reusable component used across auth and main pages
- ✅ **FileBrowser Components**: Created modular `FileBrowser`, `FileTree`, and `FilePreview` components
- ✅ **Reused Existing APIs**: Leveraged existing file tree caching and GitHub API methods for efficiency

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
- [x] Branch-aware recent files (separate entries for same file on different branches)
- [x] Recent code snippets with syntax highlighting and management features
- [x] Fuzzy search improvements (integrated Fuse.js)
- [x] Auto-scroll on keyboard navigation
- [x] Folder browsing and navigation within repositories
- [x] Search bar reset when file viewer is closed
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
- [x] Repository card layout improvements (flexbox, footer alignment, date pastilles)
- [x] Relative time display ("2h ago", "3d ago") for repositories and branches
- [x] Footer with credits and links
- [x] **Mobile-optimized touch interactions**: Proper 44px touch targets, responsive layouts, mobile-first design
- [x] **Interactive card effects**: Mouse-following shine effects with hover states
- [x] **Consistent component design**: Unified UI patterns across all card types
- [ ] Keyboard shortcuts help modal
- [ ] Better empty states and onboarding
- [ ] Accessibility improvements (ARIA labels, focus management)

### Performance
- [x] Search result caching (implemented with FileTreeCache)
- [x] Repository data caching (using LRU cache + localStorage)
- [x] Fast local search with Fuse.js fuzzy matching
- [x] GitHub Trees API for efficient file tree loading
- [x] Debounced search optimization (reduced to 100ms)
- [x] Recently browsed files cache (localStorage with timestamps)
- [x] Branch-aware recent files caching with proper cleanup
- [x] Pagination for repository listing (fetches all pages)
- [x] Repository sorting fixes (using pushed_at for accurate activity ordering)
- [ ] Lazy loading for large file lists
- [ ] Virtual scrolling for long search results
- [ ] Background repository syncing

## 🔧 Low Priority - Advanced Features

### Power User Features
- [ ] Multiple GitHub account support
- [ ] Organization repository access
- [x] Branch/tag switching (syntax: @repo-name:branch-name/file-path)
- [x] Branch autocomplete when typing : after repository name
- [x] Branch sorting by commit activity with relative time display
- [ ] File editing capabilities (if write permissions)
- [ ] Bulk file operations
- [ ] Export search results
- [ ] Integration with VS Code (open file in editor)

### Collaboration
- [x] Share file links with line highlighting (via code snippet sharing)
- [x] Social media sharing with beautiful screenshots
- [x] Code snippet library with save, view, copy, and screenshot features
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
- [x] Fixed search bar not resetting after closing file viewer
- [x] Fixed dropdown not reopening properly after search bar reset
- [x] Fixed dropdown visibility bug when typing @ after non-@ text
- [x] Fixed component complexity issues through refactoring
- [x] Fixed repository sorting showing incorrect dates (switched from updated_at to pushed_at)
- [x] Fixed repository card layout issues with footer alignment
- [ ] Handle rate limiting gracefully
- [ ] Improve error messages for network failures
- [ ] Handle very large files (>1MB)
- [ ] Fix search dropdown positioning on small screens
- [ ] Optimize bundle size

### Technical Debt
- [x] Major SearchBar component refactoring (reduced from 538 to 307 lines)
- [x] Modular component architecture with hooks and utilities
- [x] Improved TypeScript types and interfaces
- [x] **Card component organization**: Structured `/components/Card/` with shared UI components
- [x] **Component deduplication**: Reduced code duplication by ~200 lines through shared components
- [x] **Footer component extraction**: Single reusable footer for consistency
- [x] **Mobile responsiveness implementation**: Complete mobile-first design with proper touch targets
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

