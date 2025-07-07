"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Simple session management without external dependency
function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("agriha_token")
}

function getUserData(): any {
  if (typeof window === "undefined") return null
  const userData = sessionStorage.getItem("user_data")
  return userData ? JSON.parse(userData) : null
}

function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("agriha_token")
  sessionStorage.removeItem("user_data")
  sessionStorage.removeItem("temp_verification_token")
  sessionStorage.removeItem("registration_mobile")
}

function isAuthenticated(): boolean {
  return !!getToken()
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/auth/signin")
        return
      }

      const user = getUserData()
      setUserData(user)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignOut = () => {
    clearSession()
    router.push("/auth/signin")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="AGRIHA" width={120} height={40} className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {userData?.name || userData?.phone || userData?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut} className="text-sm bg-transparent">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">You're successfully signed in to your AGRIHA account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userData?.name && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-sm text-gray-900">{userData.name}</p>
                </div>
              )}
              {userData?.email && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-sm text-gray-900">{userData.email}</p>
                </div>
              )}
              {userData?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <p className="text-sm text-gray-900">{userData.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Search Properties</Button>
              <Button variant="outline" className="w-full bg-transparent">
                Post Property
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View Favorites
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">No recent activity to display.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
