"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar } from "@/components/ui/avatar"
import { getAuthToken, clearAuthTokens } from "@/lib/auth-utils"
import { decodeJwt } from "@/lib/jwt"
import { User } from "@/lib/auth-types"

interface HeaderProps {
  onSignIn?: () => void;
  user?: User | null;
}

export default function Header({ onSignIn, user: propUser }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(propUser || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Get initial search query from URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Determine context
  const isAuthPage = pathname.startsWith("/auth");
  const isAgentPage = pathname.startsWith("/agent");
  const isExplorePage = pathname.startsWith("/explore");
  const isHomePage = pathname === "/";

  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    if (onSignIn) {
      onSignIn();
    } else {
      try {
        await router.push("/auth/signin");
      } catch (error: unknown) {
        console.error('Navigation error:', error);
        // Fallback to direct navigation
        window.location.href = "/auth/signin";
      }
    }
  };

  const handleSignOut = async () => {
    clearAuthTokens();
    setUser(null);
    setIsAuthenticated(false);
    await router.push('/auth/signin');
  };

  // Handler for Post Property button
  // State for client-side loading
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Check authentication status on client side
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.exp > Date.now() / 1000) {
            setIsAuthenticated(true);
            
            // If no user prop provided, fetch user data from API
            if (!propUser) {
              try {
                const response = await fetch('/api/user', {
                  method: 'GET',
                  credentials: 'include'
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  if (userData.success && userData.user) {
                    setUser(userData.user);
                  }
                } else {
                  // API failed, but token is valid - use minimal user data
                  setUser({ 
                    id: payload.userId, 
                    firstname: 'User', 
                    lastname: '',
                    phone: '',
                    email: '',
                    is_verified: false,
                    is_customer: true,
                    is_superadmin: false,
                    is_agent: false,
                    account_created: new Date().toISOString()
                  });
                }
              } catch (fetchError) {
                console.error('Failed to fetch user data:', fetchError);
                // Use minimal user data as fallback
                setUser({ 
                  id: payload.userId, 
                  firstname: 'User', 
                  lastname: '',
                  phone: '',
                  email: '',
                  is_verified: false,
                  is_customer: true,
                  is_superadmin: false,
                  is_agent: false,
                  account_created: new Date().toISOString()
                });
              }
            }
          } else {
            clearAuthTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (when tokens are set/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'agriha_token') {
        // Token was added or removed, re-check auth
        checkAuth();
      }
    };
    
    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [propUser]);

  const handlePostProperty = async () => {
    if (isLoading) {
      return; // Don't do anything while loading
    }
    
    if (!isAuthenticated || !user) {
      await router.push("/auth/signin");
      return;
    }
    
    try {
      // All authenticated users can list properties
      await router.push("/agent/listProperty");
    } catch (error: unknown) {
      console.error('Navigation error:', error);
      // Fallback to direct navigation
      window.location.href = "/agent/listProperty";
    }
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
                if (searchQuery.trim()) {
                  router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="hidden md:flex flex-1 justify-end mx-6"
              style={{ maxWidth: 480 }}
            >
              <div className="w-full flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                <input
                  name="search"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
          {!isAuthPage && !isHomePage && !isAgentPage && !isExplorePage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="hidden md:flex flex-1 justify-center mx-6"
              style={{ maxWidth: 480 }}
            >
              <div className="w-full flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                <input
                  name="search"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={handlePostProperty}
                className="bg-[#002B6D] hover:bg-[#001a4d] text-white px-4 py-2 rounded-md text-sm"
                disabled={!isClient || isLoading}
                suppressHydrationWarning
              >
                {!isClient ? "Post Property" : (
                  isLoading ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Loading...
                    </span>
                  ) : (
                    "List Property"
                  )
                )}
              </Button>
              {isLoading ? (
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                </Button>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.firstname?.[0] || ''}{user.lastname?.[0] || '?'}
                        </div>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 z-[9999]" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.firstname || 'User'} {user.lastname || ''}</p>
                        <p className="text-xs text-gray-500">{user.phone || 'No phone number'}</p>
                        {/* Agent status removed - all users can list properties */}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/agent/dashboard">My Properties</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/explore">Explore Properties</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  className="border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-2 rounded-md text-sm"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-[#002B6D]/30 border-t-[#002B6D] rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
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
          <div className="md:hidden mt-3 flex flex-col space-y-2 pb-4">
            <Button
              onClick={handlePostProperty}
              className="w-full bg-[#002B6D] hover:bg-[#001a4d] text-white px-4 py-2 rounded-md text-sm"
            >
                      List Property
            </Button>
            {isLoading ? (
              <div className="flex items-center space-x-3 px-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-3 px-2">
                  <Avatar className="h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.firstname?.[0] || ''}{user.lastname?.[0] || '?'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.firstname || 'User'} {user.lastname || ''}</p>
                    <p className="text-xs text-gray-500">{user.phone || 'No phone number'}</p>
                    {/* Agent status removed - all users can list properties */}
                  </div>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
                    <Link href="/agent/dashboard">
                      <Button variant="ghost" className="w-full justify-start">
                        My Properties
                      </Button>
                    </Link>
                <Link href="/explore">
                  <Button variant="ghost" className="w-full justify-start">
                    Explore Properties
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="w-full border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white px-4 py-2 rounded-md text-sm"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-[#002B6D]/30 border-t-[#002B6D] rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
