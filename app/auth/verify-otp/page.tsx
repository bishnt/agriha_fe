"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Shield, Clock, X as LucideX } from "lucide-react"
import { useRouter } from "next/navigation"
import { sendOtpAction } from "@/lib/server-actions"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [mobileNumber, setMobileNumber] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    const mobile = sessionStorage.getItem("registration_mobile")
    if (!mobile) {
      router.push("/auth/access-denied")
      return
    }
    setMobileNumber(mobile)

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    // MOCK: If OTP is 123456, skip API and proceed
    if (otpString === "123456") {
      sessionStorage.setItem("temp_verification_token", "mock-temp-token-980000000")
      router.push("/auth/set-password")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber,
          otp: otpString,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem("temp_verification_token", data.tempToken)
        router.push("/auth/set-password")
      } else {
        setError(data.message || "Invalid verification code")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setCanResend(false)
    setResendTimer(30)
    setError("")

    try {
      const result = await sendOtpAction(mobileNumber)

      if (result.success) {
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true)
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.")
      setCanResend(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-2">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 lg:p-6 transform hover:scale-[1.01] transition-all duration-500 relative">



            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#002b6d] to-[#002b6d] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#002b6d] to-[#002b6d] bg-clip-text text-transparent mb-2">
                Verify Your Number
              </h1>
              <p className="text-gray-600 text-sm font-medium mb-1">Enter the 6-digit code sent to</p>
              <p className="text-[#002b6d] font-semibold text-sm">{mobileNumber}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Input */}
              <div className="flex justify-center">
                <div className="flex gap-2 lg:gap-3">
                  {otp.map((digit, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002b6d]/20 to-[#002b6d]/20 rounded-xl blur transition-all duration-300 opacity-0 group-focus-within:opacity-100"></div>
                      <Input
                        ref={(el) => {
                          inputRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="relative w-8 h-8 lg:w-10 lg:h-10 text-center text-base lg:text-lg font-bold bg-white border border-gray-300 rounded-lg focus:border-[#002b6d] focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-[#002b6d]/20"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 animate-shake">
                  <p className="text-red-600 text-xs font-medium text-center">{error}</p>
                </div>
              )}

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-8 bg-gradient-to-r from-[#002b6d] to-[#002b6d] hover:from-[#002b6d] hover:to-[#002b6d] text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 group text-xs"
              >
                <span className="flex items-center justify-center gap-1">
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Resend Section */}
            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-gray-600 text-xs">
                  Didn't receive the code?{" "}
                  {canResend ? (
                    <button
                      onClick={handleResendOTP}
                      className="text-[#002b6d] hover:text-[#002b6d] font-semibold hover:underline transition-all duration-200 text-xs"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-gray-400">Resend in {resendTimer}s</span>
                  )}
                </p>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-2">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-[#002b6d]" />
                  <p className="text-[#002b6d] text-xs font-medium">Your information is secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
