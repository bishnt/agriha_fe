"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12"> {/* ↓ Thinner height */}
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="AGRIHA"
              width={46}
              height={28}
              className="mr-1 w-5 h-auto md:w-10"
            />
            <Image
              src="/Agriha..png"
              alt="AGRIHA"
              width={160}
              height={40}
              className="w-20 h-auto md:w-36"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              onClick={onPostProperty}
              className="bg-[#002B6D] hover:bg-[#001a4d] text-white px-4 py-1.5 rounded-md font-medium text-xs transition-all duration-200"
            >
              Post Property
            </Button>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 text-sm">Hi, {user.name}</span>
                <Button
                  variant="outline"
                  className="border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-1.5 rounded-md text-xs"
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button
                onClick={onSignIn}
                variant="outline"
                className="border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-1.5 rounded-md text-xs transition-all duration-200"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Hamburger Icon */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#002B6D] hover:text-[#001a4d] focus:outline-none"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 flex flex-col space-y-2">
            <Button
              onClick={onPostProperty}
              className="w-full bg-[#002B6D] hover:bg-[#001a4d] text-white px-4 py-2 rounded-md text-sm"
            >
              Post Property
            </Button>

            {user ? (
              <>
                <span className="text-sm text-gray-700">Hi, {user.name}</span>
                <Button
                  variant="outline"
                  className="w-full border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-2 rounded-md text-sm"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <Button
                onClick={onSignIn}
                variant="outline"
                className="w-full border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-2 rounded-md text-sm"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

