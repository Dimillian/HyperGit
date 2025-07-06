import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return Response.redirect(`${process.env.NEXTAUTH_URL}?error=${error}`)
  }

  if (!code) {
    return Response.redirect(`${process.env.NEXTAUTH_URL}?error=no_code`)
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return Response.redirect(`${process.env.NEXTAUTH_URL}?error=${tokenData.error}`)
    }

    const accessToken = tokenData.access_token

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
        </head>
        <body>
          <script>
            localStorage.setItem('github_token', '${accessToken}');
            window.location.href = '${process.env.NEXTAUTH_URL}';
          </script>
        </body>
      </html>
    `

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    return Response.redirect(`${process.env.NEXTAUTH_URL}?error=callback_failed`)
  }
}