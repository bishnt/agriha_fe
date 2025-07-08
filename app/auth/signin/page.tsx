"use client"

import type React from "react"
import type { Session as NextAuthSession } from "next-auth"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Eye, EyeOff, ArrowRight, X as LucideX } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"

// Extend the Session type to include accessToken
interface SessionWithToken extends NextAuthSession {
  accessToken?: string
}

export default function SignInPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const router = useRouter()

  const validateEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[+]?[\d\s\-$$$$]{10,}$/
    return emailRegex.test(value) || phoneRegex.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmailOrPhone(emailOrPhone)) {
      setError("Please enter a valid email or phone number")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem("agriha_token", data.token)
        sessionStorage.setItem("user_data", JSON.stringify(data.user))
        router.push("/profile")
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: "google" | "facebook") => {
    try {
      const result = await signIn(provider, {
        callbackUrl: "/profile",
        redirect: false,
      })

      if (result?.ok) {
        const session = (await getSession()) as SessionWithToken
        if (session?.accessToken) {
          localStorage.setItem("agriha_token", session.accessToken as string)
        }
        router.push("/profile")
      }
    } catch (error) {
      setError("Social sign-in failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
<div className="w-full max-w-4xl px-1 py-2 lg:px-2 lg:py-4 flex flex-col lg:flex-row items-center justify-center gap-0 h-[70%]">
        {/* Outer rounded box */}
        <div className="w-full bg-white/90 rounded-2xl shadow-2xl border border-white/30 flex flex-col lg:flex-row overflow-hidden h-full relative">

          {/* Left Side - Welcome Message (hidden on mobile) */}
{/* Left Side - Social Login */}
<div className="hidden lg:flex flex-col justify-center items-center text-white bg-gradient-to-br from-[#002b6d] to-[#001a42] max-w-md w-full rounded-none lg:rounded-l-2xl px-6 py-10 space-y-6">
              <h2 className="text-3xl font-bold mb-4">
              Welcome Back!
            </h2>
            <p className="text-lg opacity-90">
              Sign in to explore verified properties and hostels, or list your own, all in one trusted platform.
            </p><br/><br/>
  <Button
    variant="outline"
    onClick={() => handleSocialSignIn("google")}
    className="w-full bg-white text-black hover:bg-gray-100 border-none h-10 font-semibold text-sm"
  >
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    Sign in with Google
  </Button>
  <Button
    variant="outline"
    onClick={() => handleSocialSignIn("facebook")}
    className="w-full bg-[#1877F2] text-white hover:bg-[#155CC2] border-none h-10 font-semibold text-sm"
  >
    <svg className="w-4 h-4 mr-2" fill="#fff" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.863c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
    Sign in with Facebook
  </Button>
</div>

          
       
          <div className="flex-1 w-full bg-white/90 rounded-none lg:rounded-r-2xl shadow-none p-2 sm:p-4 lg:p-8 flex flex-col justify-center min-h-[280px] lg:min-h-[350px] h-full items-center max-w-sm mx-auto">
            <div className="flex justify-center mb-4">
              <Image src="/logo.svg" alt="AGRIHA" width={48} height={48} className="h-10 w-auto" />
            </div>
            <div className="text-center mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0B316F] mb-2">Welcome Back!</h1>
              <p className="text-gray-600 text-base font-medium">Sign in to your AGRIHA account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {/* Email/Phone Input */}
              <div className="relative group">
                <Input
                  id="emailOrPhone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  placeholder="Email or Phone Number"
                  className="h-10 pl-10 pr-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-[#002b6d]/20 text-sm"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {emailOrPhone.includes("@") ? (
                    <Mail className="h-4 w-4 text-[#002b6d]" />
                  ) : (
                    <Phone className="h-4 w-4 text-[#002b6d]" />
                  )}
                </div>
              </div>
              {/* Password Input */}
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  placeholder="Password"
                  className="h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-[#002b6d]/20 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 animate-shake">
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}
              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-[#002b6d] to-[#001a42] hover:from-[#001a42] hover:to-[#000d1a] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 group text-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </Button>
            </form>
            {/* Divider */}
            <div className="block lg:hidden w-full">
            <div className="relative my-4 w-full flex items-center justify-center">
              <Separator className="bg-gray-200" />
              <span className="absolute bg-white px-2 text-gray-400 text-xs font-medium left-1/2 -translate-x-1/2">or continue with</span>
            </div>
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-2 mb-3 w-full">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
                className="h-9 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#002b6d]/30 hover:shadow-md transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center text-xs"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn("facebook")}
                className="h-9 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#002b6d]/30 hover:shadow-md transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center text-xs"
              >
                <svg className="w-4 h-4 mr-1" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
            </div>
            {/* Register Link */}
            <div className="text-center mt-1 py-4">
              <p className="text-gray-600 text-xs">
                New to AGRIHA?{" "}
                <Link href="/auth/register" className="text-[#0B316F] hover:text-[#1B447A] font-semibold hover:underline transition-all duration-200">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
