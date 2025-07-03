"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
  } | null
  onSignIn?: () => void
  onPostProperty?: () => void
}

export default function Header({ user, onSignIn, onPostProperty }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="AGRIHA" width={46} height={28} className="mr-3" />
            <Image src="/Agriha..png" alt="AGRIHA" width={160} height={40} />


          </Link>

          <div className="flex items-center space-x-3">
            <Button
              onClick={onPostProperty}
              className="bg-[#002B6D] hover:bg-[#001a4d] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
            >
              Post Property
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                <Button
                  variant="outline"
                  className="border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white bg-transparent px-6 py-2.5 rounded-lg font-semibold text-sm"
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button
                onClick={onSignIn}
                variant="outline"
                className="border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-6 py-2.5 rounded-lg font-semibold text-sm bg-transparent transition-all duration-200"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
