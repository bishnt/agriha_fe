"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeftCircle, Frown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 md:p-16 max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" width={140} height={45} alt="AGRIHA" className="h-12 w-auto" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
            <Frown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Oops, something went wrong
          </h1>
          <p className="text-gray-600">
            We couldn’t sign you in due to an unexpected error. Please try again, or contact support if the problem
            persists.
          </p>

          <Button
            asChild
            className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Link href="/auth/signin" className="flex items-center gap-2">
              <ArrowLeftCircle className="w-5 h-5" />
              Back to Sign-in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}