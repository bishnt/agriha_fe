"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { getAuthToken, clearAuthTokens, setAuthTokens } from '@/lib/auth-utils'
import { decodeJwt } from '@/lib/jwt'
import { ACCOUNT_QUERY } from '@/lib/graphql'

interface User {
  id: number
  firstname: string
  lastname: string
  email: string | null
  phone: string
  is_verified: boolean
  is_agent: boolean
  is_customer: boolean
  agent_status?: 'pending' | 'verified' | 'rejected'
  account_created: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, refreshToken?: string) => void
  logout: () => void
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const apolloClient = useApolloClient()

  // Get token and decode user ID
  const token = typeof window !== 'undefined' ? getAuthToken() : null
  const decodedToken = token ? decodeJwt(token) : null

  // Fetch user profile using the ID from JWT token
  const { data: profileData, loading: profileLoading, refetch } = useQuery(ACCOUNT_QUERY, {
    variables: { id: decodedToken?.userId || 0 },
    skip: !decodedToken?.userId || !isAuthenticated,
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Auth profile fetch error:', error)
      handleLogout()
    }
  })

  const user = profileData?.account?.account || null

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!token || !decodedToken?.userId) {
          setIsAuthenticated(false)
          setIsInitialized(true)
          return
        }

        // Check if token is expired
        const expiryDate = decodedToken.exp * 1000 // Convert to milliseconds
        if (Date.now() >= expiryDate) {
          handleLogout()
          return
        }

        // Token is valid, set authenticated state
        setIsAuthenticated(true)
        setIsInitialized(true)
      } catch (error) {
        console.error('Auth initialization error:', error)
        handleLogout()
      }
    }

    initializeAuth()
  }, [token, decodedToken])

  const handleLogin = (accessToken: string, refreshToken?: string) => {
    setAuthTokens(accessToken, refreshToken)
    setIsAuthenticated(true)
    // Token change will trigger useEffect to refetch user data
  }

  const handleLogout = async () => {
    clearAuthTokens()
    setIsAuthenticated(false)
    
    try {
      await apolloClient.resetStore()
    } catch (error) {
      console.error('Error resetting Apollo cache:', error)
    }

    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const refetchUser = () => {
    if (isAuthenticated && decodedToken?.userId) {
      refetch()
    }
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: !isInitialized || (isAuthenticated && profileLoading),
    login: handleLogin,
    logout: handleLogout,
    refetchUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}