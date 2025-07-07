"use client"

export class SessionManager {
  private static instance: SessionManager
  private token: string | null = null
  private userData: any = null

  private constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("agriha_token")
      const userData = sessionStorage.getItem("user_data")
      this.userData = userData ? JSON.parse(userData) : null
    }
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  getToken(): string | null {
    return this.token
  }

  getUserData(): any {
    return this.userData
  }

  setSession(token: string, userData: any): void {
    this.token = token
    this.userData = userData

    if (typeof window !== "undefined") {
      localStorage.setItem("agriha_token", token)
      sessionStorage.setItem("user_data", JSON.stringify(userData))
    }
  }

  clearSession(): void {
    this.token = null
    this.userData = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("agriha_token")
      sessionStorage.removeItem("user_data")
      sessionStorage.removeItem("temp_verification_token")
      sessionStorage.removeItem("registration_mobile")
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // Helper method to make authenticated GraphQL requests
  async graphqlRequest(query: string, variables?: any) {
    if (!this.token) {
      throw new Error("No authentication token available")
    }

    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ query, variables }),
    })

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    return data.data
  }
}

export const sessionManager = SessionManager.getInstance()
