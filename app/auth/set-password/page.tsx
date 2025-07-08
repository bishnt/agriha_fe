"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check, X, ArrowRight, Sparkles, Lock, Shield, X as LucideX } from "lucide-react"
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

        router.push("/profile")
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
      <div className="absolute top-10 left-10 animate-float">
        <Sparkles className="w-4 h-4 text-[#002b6d]/60" />
      </div>
      <div className="absolute top-24 right-16 animate-float-delayed">
        <Lock className="w-3 h-3 text-[#002b6d]/60" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-2">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 lg:p-6 transform hover:scale-[1.01] transition-all duration-500 relative">
            {/* Exit/Cross Button */}
            <button
              onClick={() => router.push("/")}
              aria-label="Exit auth"
              className="absolute top-3 right-3 z-20 p-0.5 rounded-xl bg-gradient-to-br from-pink-500 via-rose-400 to-red-400 hover:from-pink-600 hover:to-red-500 transition-all shadow-lg"
              style={{ minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LucideX className="w-5 h-5 text-white" />
            </button>


            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#002b6d] to-[#002b6d] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#002b6d] to-[#002b6d] bg-clip-text text-transparent mb-2">
                Set Your Password
              </h1>
              <p className="text-gray-600 text-sm font-medium">Create a secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="h-8 pl-3 pr-8 bg-white/50 border border-gray-200/50 rounded-lg text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 shadow-md hover:shadow-lg text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#002b6d] transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    className="h-8 pl-3 pr-8 bg-white/50 border border-gray-200/50 rounded-lg text-gray-900 focus:border-[#002b6d] focus:bg-white transition-all duration-300 shadow-md hover:shadow-lg text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#002b6d] transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50/50 border border-gray-200/50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#002b6d]" />
                  Password Requirements
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                          req.test(password) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {req.test(password) ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                      </div>
                      <span
                        className={`text-xs transition-colors duration-300 ${
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
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    doPasswordsMatch ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      doPasswordsMatch ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {doPasswordsMatch ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                  </div>
                  <span className={`text-xs font-medium ${doPasswordsMatch ? "text-green-600" : "text-red-600"}`}>
                    {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 animate-shake">
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Create Account Button */}
              <Button
                type="submit"
                className="w-full h-8 bg-gradient-to-r from-[#002b6d] to-[#002b6d] hover:from-[#002b6d] hover:to-[#002b6d] text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                <span className="flex items-center justify-center gap-1">
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-4 bg-blue-50/50 border border-blue-200/50 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-[#002b6d]" />
                <p className="text-[#002b6d] text-xs font-medium">Your password is encrypted and stored securely</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
