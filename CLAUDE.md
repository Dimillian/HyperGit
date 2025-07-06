# HyperGit Development Guide

## Project Overview
HyperGit is a lightning-fast GitHub file search frontend. Users authenticate with their GitHub Personal Access Token and can quickly search and view files across all their repositories using an intuitive @-mention syntax.

## Development Rules

### TODO Management
**IMPORTANT**: Always update the [TODO.md](./TODO.md) file when:
- Starting work on a new feature
- Completing a feature or subtask
- Discovering new requirements or edge cases
- Changing feature priorities
- Finding bugs that need to be tracked

The TODO.md file is the single source of truth for all pending work.

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linter
```

## Environment Setup

### Required Dependencies
- Next.js 15+ with TypeScript
- Tailwind CSS for styling
- React Syntax Highlighter for code display
- Lucide React for icons

### Local Storage Keys
- `github_token` - GitHub Personal Access Token for API authentication

## Architecture

### Core Components
- `SearchBar` - Main search interface with @-mention autocomplete
- `FileViewer` - Modal file display with syntax highlighting  
- `AuthPrompt` - GitHub token authentication UI
- `useGitHub` - Custom hook for GitHub API state management

### GitHub API Integration
- Token-based authentication via Personal Access Tokens
- Repository listing and file search
- File content retrieval with base64 decoding
- Syntax highlighting based on file extensions

## The Vision

Enable this seamless workflow:
1. Type `@` to see your repositories
2. Select a repo and continue typing `/filename` 
3. Instantly search files across the entire repository
4. Click to view with beautiful syntax highlighting
5. Copy code or open directly in GitHub

## Important Development Guidelines

### Code Development Rules
```
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS update TODO.md when making progress on features, finding bugs, or discovering new requirements.
```

### TODO Management
The [TODO.md](./TODO.md) file must be kept up to date as the single source of truth for all pending work. Update it whenever you:
- Start or complete work on any feature
- Discover new requirements or edge cases
- Find bugs that need tracking
- Change priorities based on user feedback