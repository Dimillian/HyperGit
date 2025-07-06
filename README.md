# HyperGit ⚡

> Lightning fast GitHub file search and browser with a sleek dark theme

HyperGit is a beautiful, cyberpunk-styled web frontend that lets you instantly search and view files across all your GitHub repositories. Built for developers who need to quickly find and reference code with style.

## ✨ Features

- **@-mention search**: Type `@repo-name/filename` to instantly find files
- **Two-stage navigation**: Browse repositories → search files within
- **GitHub OAuth**: One-click authentication with GitHub (or use Personal Access Tokens)
- **Dark theme**: Sleek black interface with neon purple accents
- **Syntax highlighting**: Beautiful code display with dark theme syntax highlighting
- **Keyboard navigation**: Full keyboard support with auto-scrolling
- **Glass effects**: Shiny, reactive UI with backdrop blur and neon glows
- **Responsive design**: Works perfectly on desktop and mobile
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

### Keyboard Shortcuts
- `↑/↓` - Navigate search results (auto-scrolls)
- `Enter` - Select repository or file
- `Escape` - Go back or close
- Copy button in file viewer - Copy file content

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
├── app/                      # Next.js app router
│   ├── api/auth/            # OAuth API routes
│   │   ├── github/          # GitHub OAuth initiation
│   │   └── callback/        # OAuth callback handler
│   ├── globals.css          # Global styles with dark theme
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/              # React components
│   ├── AuthPrompt.tsx       # GitHub OAuth + token auth
│   ├── FileViewer.tsx       # File display modal with dark theme
│   └── SearchBar.tsx        # Main search interface with glass effects
├── hooks/                   # Custom React hooks
│   └── useGitHub.ts         # GitHub API state management
├── lib/                     # Utilities
│   └── github/
│       └── api.ts           # GitHub API client
├── .env.example             # Environment variables template
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