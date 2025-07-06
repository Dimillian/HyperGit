# HyperGit ⚡

> Lightning fast GitHub file search and browser

HyperGit is a beautiful, minimal web frontend that lets you instantly search and view files across all your GitHub repositories. Built for developers who need to quickly find and reference code.

## ✨ Features

- **@-mention search**: Type `@repo-name/filename` to instantly find files
- **Two-stage navigation**: Browse repositories → search files within
- **Syntax highlighting**: Beautiful code display with copy functionality
- **Keyboard navigation**: Full keyboard support for power users
- **Responsive design**: Works perfectly on desktop and mobile
- **Private repos**: Access your private repositories securely

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd HyperGit
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Get a GitHub token**
   - Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
   - Create a new token with `repo` scope
   - Copy the token (starts with `ghp_`)

4. **Login and search**
   - Open http://localhost:3000
   - Paste your GitHub token
   - Start searching with `@repo-name/filename`

## 🎯 How to Use

### Basic Search
1. Type `@` to see your repositories
2. Select a repository (or keep typing to filter)
3. Type `/` followed by filename to search within the repo
4. Click any file to view with syntax highlighting

### Keyboard Shortcuts
- `↑/↓` - Navigate search results
- `Enter` - Select repository or file
- `Escape` - Go back or close
- `Ctrl+C` - Copy file content (when viewing)

### Example Searches
- `@my-app` - Find "my-app" repository
- `@my-app/component` - Search for files containing "component"
- `@my-app/src/utils.ts` - Find specific file path

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Syntax Highlighting**: React Syntax Highlighter
- **API**: GitHub REST API v3

## 📁 Project Structure

```
HyperGit/
├── app/                 # Next.js app router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/          # React components
│   ├── AuthPrompt.tsx  # GitHub token auth
│   ├── FileViewer.tsx  # File display modal
│   └── SearchBar.tsx   # Main search interface
├── hooks/              # Custom React hooks
│   └── useGitHub.ts    # GitHub API state
├── lib/                # Utilities
│   └── github/
│       └── api.ts      # GitHub API client
└── README.md
```

## 🔧 Configuration

### GitHub Token Requirements
Your GitHub Personal Access Token needs:
- `repo` scope for private repository access
- `public_repo` scope for public repositories (included in `repo`)

### Environment Variables
No environment variables required - authentication is handled via browser localStorage.

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