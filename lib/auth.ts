import { redirect } from 'next/navigation'
export type { Session } from '@/lib/auth-types'

import type { Session } from '@/lib/auth-types'

// Simple session management without JWT
export async function auth(): Promise<Session | null> {
  // Authentication is handled entirely by the backend
  // Frontend doesn't manage sessions or tokens
  return null
}

// Login function that communicates with your backend
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const graphqlEndpoint =
      process.env.GRAPHQL_ENDPOINT ||
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      'http://localhost:4000/graphql'

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({
        query: `
          mutation Login($loginInput: loginInput!) {
            login(loginInput: $loginInput) {
              success
              message
            }
          }
        `,
        variables: { 
          loginInput: { 
            email, 
            password 
          } 
        },
      }),
    })

    const data = await response.json()

    if (data.data?.login?.success) {
      return {
        success: true,
      }
    } else {
      return {
        success: false,
        error: data.data?.login?.message || data.errors?.[0]?.message || 'Login failed',
      }
    }
  } catch {
    return {
      success: false,
      error: 'Network error',
    }
  }
}

// Social login function
export async function socialLogin(provider: string, accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const graphqlEndpoint =
      process.env.GRAPHQL_ENDPOINT ||
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      'http://localhost:4000/graphql'

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({
        query: `
          mutation SocialSignIn($input: SocialSignInInput!) {
            socialSignIn(input: $input) {
              success
              message
            }
          }
        `,
        variables: {
          input: {
            provider,
            accessToken,
          },
        },
      }),
    })

    const data = await response.json()

    if (data.data?.socialSignIn?.success) {
      return {
        success: true,
      }
    } else {
      return {
        success: false,
        error: data.data?.socialSignIn?.message || data.errors?.[0]?.message || 'Social login failed',
      }
    }
  } catch {
    return {
      success: false,
      error: 'Network error',
    }
  }
}

// Server action for logout
export async function logoutAction() {
  // Logout is handled by backend
  redirect('/auth/signin')
}

