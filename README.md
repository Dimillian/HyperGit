# HyperGit ⚡

> Lightning fast GitHub file search and browser with a sleek dark theme

HyperGit is a beautiful, cyberpunk-styled web frontend that lets you instantly search and view files across all your GitHub repositories. Built for developers who need to quickly find and reference code with style.

## ✨ Features

- **@-mention search**: Type `@repo-name/filename` to instantly find files
- **Branch switching**: Use `@repo-name:branch-name/filename` syntax to search specific branches
- **Folder browsing**: Navigate repository structure manually with breadcrumb navigation
- **Code snippet sharing**: Select lines of code and generate beautiful screenshots for social media
- **Recent code snippets**: Save and manage code snippets with syntax highlighting and quick access
- **Two-stage navigation**: Browse repositories → explore folders → search files
- **GitHub OAuth**: One-click authentication with GitHub (or use Personal Access Tokens)
- **Dark theme**: Sleek black interface with neon purple accents
- **Syntax highlighting**: Beautiful code display with dark theme syntax highlighting
- **Keyboard navigation**: Full keyboard support with auto-scrolling and folder navigation
- **Glass effects**: Shiny, reactive UI with backdrop blur and neon glows
- **Smart caching**: Lightning-fast search with intelligent file tree caching
- **Language icons**: Professional programming language icons from Simple Icons
- **Recent files**: Track and quickly access recently viewed files with branch awareness
- **Snippet library**: Personal collection of saved code snippets with search and management
- **Responsive design**: Works perfectly on desktop and mobile with optimized touch targets
- **Mobile-first**: Enhanced mobile experience with proper touch interactions and responsive layouts
- **Interactive cards**: Mouse-following shine effects for engaging hover experiences
- **Private repos**: Access your private repositories securely

## 🚀 Quick Start

### Option 1: GitHub OAuth (Recommended)

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd HyperGit
   npm install
   ```

2. **Set up GitHub OAuth**
   - Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
   - Create a new OAuth App with:
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback`
   - Copy the Client ID and Client Secret

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your GitHub OAuth credentials
   ```

4. **Start and use**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Click "Sign in with GitHub"
   # Start searching with @repo-name/filename
   ```

### Option 2: Personal Access Token

1. **Get a GitHub token**
   - Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
   - Create a new token with `repo` scope
   - Copy the token (starts with `ghp_`)

2. **Login manually**
   - Click "Use Personal Access Token instead"
   - Paste your token and connect

## 🎯 How to Use

### Basic Search
1. Type `@` to see your repositories
2. Select a repository (or keep typing to filter)
3. Type `/` followed by filename to search within the repo
4. Click any file to view with syntax highlighting

### Branch-Specific Search
1. Type `@repo-name:` to see available branches
2. Select a branch to search within that specific branch
3. Continue with `/filename` to search files on that branch
4. All recent files and snippets are tracked per branch

### Folder Browsing
1. Select a repository to enter folder browsing mode
2. Click folder icons to navigate into directories
3. Use breadcrumb navigation to go back to parent folders
4. Press `Escape` to go back one folder level
5. Switch between browsing and searching seamlessly

### Keyboard Shortcuts
- `↑/↓` - Navigate search results (auto-scrolls)
- `Enter` - Select repository, folder, or file
- `Escape` - Go back one folder level, close file viewer, or reset search
- Copy button in file viewer - Copy file content

### Example Searches
- `@my-app` - Find "my-app" repository
- `@my-app:main/component` - Search for files containing "component" on main branch
- `@my-app:feature-branch/utils` - Search files on specific branch
- `@my-app/src/utils.ts` - Find specific file path

### Smart Features
- **Recent Files**: Automatically tracks your recently viewed files with branch awareness
- **Recent Snippets**: Personal library of saved code snippets with syntax highlighting
- **File Tree Caching**: Repository structure is cached for instant browsing (per branch)
- **Search Reset**: File viewer automatically resets search bar when closed

### Code Snippet Features
1. **Sharing**: Open any file in the file viewer
2. Select lines of code by clicking and dragging
3. Click "Save Snippet" to add to your personal library
4. Click "Share Snippet" to generate beautiful screenshots for social media
5. **Managing**: Access your snippet library from the homepage
6. Click any snippet to view with syntax highlighting
7. Copy code, generate screenshots, or view on GitHub
8. Remove snippets you no longer need

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React + Simple Icons for programming languages
- **Syntax Highlighting**: React Syntax Highlighter with dark theme
- **Screenshot Generation**: html2canvas for social media sharing
- **API**: GitHub REST API v3 with GitHub Trees API for efficient file loading
- **Caching**: LRU cache with localStorage persistence
- **Analytics**: Vercel Analytics

## 📁 Project Structure

```
HyperGit/
├── app/                      # Next.js app router
│   ├── api/auth/            # OAuth API routes
│   │   ├── github/          # GitHub OAuth initiation
│   │   └── callback/        # OAuth callback handler
│   ├── globals.css          # Global styles with dark theme
│   ├── layout.tsx           # Root layout with analytics
│   └── page.tsx             # Main page with language icons
├── components/              # React components
│   ├── AuthPrompt.tsx       # GitHub OAuth + token auth
│   ├── FileViewer.tsx       # File display modal with line selection, saving, and sharing
│   ├── Footer.tsx           # Reusable footer component
│   ├── LoadingScreen.tsx    # Loading screen component
│   ├── SnippetViewer.tsx    # Snippet modal with syntax highlighting and actions
│   ├── Card/                # Card-related components (organized)
│   │   ├── components/      # Card implementation components
│   │   │   ├── RecentFiles.tsx      # Recent files tracking with branch awareness
│   │   │   ├── RecentSnippets.tsx   # Snippet library with syntax highlighting previews
│   │   │   └── index.ts             # Component exports
│   │   ├── ui/              # Shared card UI components
│   │   │   ├── CardActions.tsx      # Reusable action buttons
│   │   │   ├── FilePathDisplay.tsx  # Consistent path formatting
│   │   │   ├── LanguageIcon.tsx     # Programming language icons
│   │   │   ├── ShineCard.tsx        # Interactive hover effects
│   │   │   ├── TimePill.tsx         # Consistent time display
│   │   │   └── index.ts             # UI component exports
│   │   └── index.ts         # Main card exports
│   └── SearchBar/           # Modular SearchBar components
│       ├── components/      # UI components
│       │   ├── RepositoryDropdown.tsx
│       │   ├── FileDropdown.tsx
│       │   └── BranchDropdown.tsx
│       ├── hooks/           # Custom hooks
│       │   ├── useDropdownVisibility.ts
│       │   └── useKeyboardNavigation.ts
│       └── utils/           # Utility functions
│           └── folderUtils.ts
├── hooks/                   # Custom React hooks
│   └── useGitHub.ts         # GitHub API state management
├── lib/                     # Utilities
│   ├── github/
│   │   ├── api.ts           # GitHub API client
│   │   └── cache.ts         # File tree caching system
│   ├── recentFiles.ts       # Recent files management
│   └── recentSnippets.ts    # Recent snippets management
├── global.d.ts              # TypeScript global definitions
├── .env.example             # Environment variables template
├── TODO.md                  # Development roadmap
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with your GitHub OAuth credentials:

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret
```

For production deployment (e.g., Vercel):
- Update `NEXTAUTH_URL` to your production domain
- Update your GitHub OAuth app callback URL to match
- Add all environment variables to your hosting platform

### GitHub Requirements
- OAuth App with `repo` scope for repository access
- Or Personal Access Token with `repo` scope (fallback option)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Update [TODO.md](./TODO.md) if adding/completing features
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📝 Development

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Development Guidelines
- Follow the patterns established in existing components
- Update TODO.md when working on features
- Use TypeScript strictly
- Keep components focused and minimal
- Maintain responsive design

## 🐛 Known Issues

See [TODO.md](./TODO.md#-bug-fixes--polish) for current known issues and planned fixes.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by the need for fast GitHub file browsing
- Built on top of GitHub's excellent REST API
- Uses the beautiful Lucide icon set