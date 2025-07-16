"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
  } | null
  onSignIn?: () => void
  // Remove onPostProperty from props as it will be handled internally
}

export default function Header({ user, onSignIn }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname();

  // Determine context
  const isAuthPage = pathname.startsWith("/auth");
  const isAgentPage = pathname.startsWith("/agent");
   const isExlplorePage = pathname.startsWith("/explore");
  const isHomePage = pathname === "/";

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn()
    } else {
      router.push("/auth/signin")
    }
  }

  // New handler for Post Property button
  const handlePostProperty = () => {
    router.push("/agent/dashboard");
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
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

          {/* Search Bar placement logic */}
          {/* On auth pages, move search bar to right; on home, hide; on others, center */}
          {isAuthPage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search") as string;
                // Optionally, handle search here
              }}
              className="hidden md:flex flex-1 justify-end mx-6"
              style={{ maxWidth: 480 }}
            >
              <div className="w-full flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                <input
                  name="search"
                  type="text"
                  placeholder="Search..."
                  className="flex-1 h-9 px-3 py-1 text-base border-0 focus:ring-0 bg-transparent placeholder:text-gray-500"
                />
                <Button
                  type="submit"
                  className="bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-md px-4 py-1.5 font-medium text-sm"
                >
                  Search
                </Button>
              </div>
            </form>
          )}
          {!isAuthPage && !isHomePage && !isAgentPage && !isExlplorePage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search") as string;
                // Optionally, handle search here
              }}
              className="hidden md:flex flex-1 justify-center mx-6"
              style={{ maxWidth: 480 }}
            >
              <div className="w-full flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                <input
                  name="search"
                  type="text"
                  placeholder="Search..."
                  className="flex-1 h-9 px-3 py-1 text-base border-0 focus:ring-0 bg-transparent placeholder:text-gray-500"
                />
                <Button
                  type="submit"
                  className="bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-md px-4 py-1.5 font-medium text-sm"
                >
                  Search
                </Button>
              </div>
            </form>
          )}

          {/* Desktop Nav */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center space-x-2">
              <Button
                onClick={handlePostProperty} // Use the new handler
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
                  onClick={handleSignIn}
                  variant="outline"
                  className="border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-1.5 rounded-md text-xs transition-all duration-200"
                >
                  Sign In
                </Button>
              )}
            </div>
          )}
          {/* On auth pages, hide nav */}

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
        {!isAuthPage && isMenuOpen && (
          <div className="md:hidden mt-3 flex flex-col space-y-2">
            <Button
              onClick={handlePostProperty} // Use the new handler
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
                onClick={handleSignIn}
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