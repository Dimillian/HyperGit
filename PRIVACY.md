# Privacy Policy

## Overview
HyperGit is a client-side GitHub file search application that prioritizes user privacy. This privacy policy explains how we handle your data.

## Data Collection and Storage

### What We Collect
- **GitHub Personal Access Token**: Required for authenticating with GitHub's API
- **Search History**: Recent files and code snippets you've accessed (stored locally)
- **Repository Cache**: File tree data to improve search performance (stored locally)

### How We Store Data
- **Local Storage Only**: All data is stored locally in your browser using localStorage
- **No Server Storage**: We do not store any user data on our servers

## Third-Party Services

### GitHub Integration
- We use GitHub's OAuth API for authentication
- We use GitHub's REST API to fetch repository and file data
- All API calls are made directly from your browser to GitHub's servers
- We only request the minimum required permissions (repository access)

### Data Transmission
- Your GitHub token is temporarily processed by our OAuth callback endpoint to complete authentication
- Once authentication is complete, the token is immediately stored in your browser's localStorage
- All subsequent GitHub API calls are made directly from your browser

## Data Usage
- GitHub tokens are used solely to authenticate API requests to GitHub
- Cached data is used only to improve search performance
- No data is shared with third parties or used for any other purpose

## Data Control
- You can clear all stored data by clearing your browser's localStorage
- You can revoke access at any time through your GitHub account settings
- Uninstalling or clearing browser data will remove all locally stored information

## Contact
If you have questions about this privacy policy, please contact us through GitHub issues.

---