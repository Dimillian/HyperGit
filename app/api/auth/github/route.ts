import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  
  if (!clientId) {
    return Response.json({ error: 'GitHub client ID not configured' }, { status: 500 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    scope: 'repo',
    state: Math.random().toString(36).substring(7)
  })

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`
  
  return Response.redirect(githubAuthUrl)
}