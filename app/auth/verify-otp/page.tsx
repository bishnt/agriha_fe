"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

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
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      })

      if (response.ok) {
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 animate-float">
        <Sparkles className="w-6 h-6 text-[#002b6d]/60" />
      </div>
      <div className="absolute top-40 right-32 animate-float-delayed">
        <Shield className="w-5 h-5 text-[#002b6d]/60" />
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
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#002b6d] to-[#002b6d] bg-clip-text text-transparent mb-3">
                Verify Your Number
              </h1>
              <p className="text-gray-600 text-lg font-medium mb-2">Enter the 6-digit code sent to</p>
              <p className="text-[#002b6d] font-semibold text-lg">{mobileNumber}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Input */}
              <div className="flex justify-center">
                <div className="flex gap-3 lg:gap-4">
                  {otp.map((digit, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002b6d]/20 to-[#002b6d]/20 rounded-2xl blur transition-all duration-300 opacity-0 group-focus-within:opacity-100"></div>
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
                        className="relative w-12 h-12 lg:w-14 lg:h-14 text-center text-lg lg:text-xl font-bold bg-white border border-gray-300 rounded-xl focus:border-[#002b6d] focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-[#002b6d]/20"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-shake">
                  <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                </div>
              )}

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#002b6d] to-[#002b6d] hover:from-[#002b6d] hover:to-[#002b6d] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 group"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Resend Section */}
            <div className="text-center mt-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-gray-600">
                  Didn't receive the code?{" "}
                  {canResend ? (
                    <button
                      onClick={handleResendOTP}
                      className="text-[#002b6d] hover:text-[#002b6d] font-semibold hover:underline transition-all duration-200"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-gray-400">Resend in {resendTimer}s</span>
                  )}
                </p>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-[#002b6d]" />
                  <p className="text-[#002b6d] text-sm font-medium">Your information is secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
