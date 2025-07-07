"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check, X, ArrowRight, Sparkles, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const router = useRouter()

  useEffect(() => {
    const tempToken = sessionStorage.getItem("temp_verification_token")
    const mobileNumber = sessionStorage.getItem("registration_mobile")
    if (!tempToken || !mobileNumber) {
      router.push("/auth/access-denied")
    }
  }, [router])

  const passwordRequirements = [
    { text: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { text: "Contains uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: "Contains lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: "Contains number", test: (pwd: string) => /\d/.test(pwd) },
    { text: "Contains special character", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.test(password))
  const doPasswordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isPasswordValid) {
      setError("Please meet all password requirements")
      return
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const tempToken = sessionStorage.getItem("temp_verification_token")
      const mobileNumber = sessionStorage.getItem("registration_mobile")

      const response = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          mobileNumber,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem("agriha_token", data.token)
        sessionStorage.setItem("user_data", JSON.stringify(data.user))

        sessionStorage.removeItem("temp_verification_token")
        sessionStorage.removeItem("registration_mobile")

        router.push("/dashboard")
      } else {
        setError(data.message || "Failed to create account")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#002b6d]/20 to-[#002b6d]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#002b6d]/20 to-[#002b6d]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 animate-float">
        <Sparkles className="w-6 h-6 text-[#002b6d]/60" />
      </div>
      <div className="absolute top-40 right-32 animate-float-delayed">
        <Lock className="w-5 h-5 text-[#002b6d]/60" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12 transform hover:scale-[1.02] transition-all duration-500">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image src="/logo.svg" alt="AGRIHA" width={140} height={45} className="h-12 w-auto" />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#002b6d] to-[#002b6d] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#002b6d] to-[#002b6d] bg-clip-text text-transparent mb-3">
                Set Your Password
              </h1>
              <p className="text-gray-600 text-lg font-medium">Create a secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div className="relative group">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Password"
                    className="h-14 pl-4 pr-12 bg-white/50 border-2 border-gray-200/50 rounded-2xl text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#002b6d] transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Confirm Password"
                    className="h-14 pl-4 pr-12 bg-white/50 border-2 border-gray-200/50 rounded-2xl text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#002b6d] transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50/50 border border-gray-200/50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#002b6d]" />
                  Password Requirements
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                          req.test(password) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {req.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          req.test(password) ? "text-green-600 font-medium" : "text-gray-500"
                        }`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    doPasswordsMatch ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      doPasswordsMatch ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {doPasswordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </div>
                  <span className={`text-sm font-medium ${doPasswordsMatch ? "text-green-600" : "text-red-600"}`}>
                    {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-shake">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Create Account Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-[#002b6d] to-[#002b6d] hover:from-[#002b6d] hover:to-[#002b6d] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-8 bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-[#002b6d]" />
                <p className="text-[#002b6d] text-sm font-medium">Your password is encrypted and stored securely</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
