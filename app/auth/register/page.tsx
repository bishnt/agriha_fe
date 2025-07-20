"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, ArrowRight, Sparkles, Home, Users, Shield, X as LucideX } from "lucide-react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export default function RegisterPage() {
  const [mobileNumber, setMobileNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const router = useRouter()

  const validateMobileNumber = (number: string) => {
    const mobileRegex = /^[+]?[1-9]\d{9,14}$/
    return mobileRegex.test(number.replace(/\s/g, ""))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateMobileNumber(mobileNumber)) {
      setError("Please enter a valid mobile number")
      return
    }

    setIsLoading(true)

    // MOCK: If phone number is 980000000, skip API and redirect
    if (mobileNumber.replace(/\s/g, "") === "9800000000") {
      sessionStorage.setItem("registration_mobile", mobileNumber)
      router.push("/auth/verify-otp")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: mobileNumber.replace(/\s/g, ""),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem("registration_mobile", mobileNumber)
        router.push("/auth/verify-otp")
      } else {
        setError(data.message || "Failed to send OTP. Please try again.")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a placeholder for social sign-in
  const handleSocialSignIn = (provider: string) => {
    alert(`Social sign-in with ${provider} is not implemented yet.`)
  }

  return (
<div className="min-h-screen flex flex-col items-center justify-start py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
<div className="w-full max-w-4xl px-1 py-2 lg:px-2 lg:py-4 flex flex-col lg:flex-row items-center justify-center gap-0 h-[70%]">
        {/* Outer rounded box */}
        <div className="w-full bg-white/90 rounded-2xl shadow-2xl border border-white/30 flex flex-col lg:flex-row overflow-hidden h-full relative">

          {/* Left Side - About Message (hidden on mobile) */}
          <div className="hidden lg:flex flex-1 max-w-md w-full bg-gradient-to-br from-[#002b6d] to-[#001a42] rounded-none lg:rounded-l-2xl shadow-none p-8 text-white flex-col justify-center min-h-[350px]">
            <h2 className="text-3xl font-bold mb-4">Create account</h2>
            <p className="text-lg opacity-90">
              Create your account in seconds and discover a wide range of verified spaces — from hostels and shared rooms to full properties for rent or sale. Your perfect place is waiting.
            </p>
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100 text-base">Browse and list premium properties</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100 text-base">Connect with verified owners and hosts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100 text-base">Enjoy a secure and seamless experience</span>
              </div>
            </div>
          </div>
          {/* Right Side - Register Form (matches sign in) */}
          <div className="flex-1 w-full bg-white/90 rounded-none lg:rounded-r-2xl shadow-none p-2 sm:p-4 lg:p-8 flex flex-col justify-center min-h-[280px] lg:min-h-[350px] h-full items-center max-w-sm mx-auto">
            <div className="flex justify-center mb-4">
              <Image src="/logo.svg" alt="AGRIHA" width={48} height={48} className="h-10 w-auto" />
            </div>
            <div className="text-center mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0B316F] mb-2">Create Account</h1>
              <p className="text-gray-600 text-base font-medium">Enter your mobile number to get started</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {/* Mobile Input */}
              <div className="relative group">
                <Input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  onFocus={() => setFocusedField("mobile")}
                  onBlur={() => setFocusedField("")}
                  placeholder="Mobile Number"
                  className="h-10 pl-10 pr-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-[#002b6d]/20 text-sm"
                  required
                />
                <div className="absolute left-3 top-[34%] transform -translate-y-1/2">
                  <Phone className="h-4 w-4 text-[#002b6d]" />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-2">We'll send you a verification code via SMS</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 animate-shake">
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-[#002b6d] to-[#001a42] hover:from-[#001a42] hover:to-[#000d1a] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 group text-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </Button>
            </form>
            {/* Already have an account? */}
            <div className="text-center mt-1 py-4">
              <p className="text-gray-600 text-xs">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-[#0B316F] hover:text-[#1B447A] font-semibold hover:underline transition-all duration-200">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
