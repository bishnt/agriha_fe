"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { ACCOUNT_QUERY } from "@/lib/graphql";

export default function ProfileClient() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [accountId, setAccountId] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('user_data')
      if (raw) {
        const parsed = JSON.parse(raw)
        const id = parsed?.id ?? parsed?.accountId
        const n = typeof id === 'string' ? parseInt(id, 10) : id
        if (Number.isFinite(n)) setAccountId(n as number)
      }
    } catch {}
  }, [])

  const { data } = useQuery(ACCOUNT_QUERY, {
    skip: accountId == null,
    variables: { id: accountId as number },
  })

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/signin');
    } catch (error) {
      console.error("Sign out error:", error);
      router.push('/auth/signin');
    } finally {
      setIsSigningOut(false);
    }
  };

  const account = data?.account?.account

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {account ? (
                  <>Welcome, {account.firstname ?? account.email ?? account.phone}</>
                ) : (
                  <>Profile</>
                )}
              </span>
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                disabled={isSigningOut}
                className="text-sm bg-transparent"
              >
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your AGRIHA account information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {account?.firstname && (
                <div>
                  <span className="text-sm font-medium text-gray-500">First Name:</span>
                  <p className="text-sm text-gray-900">{account.firstname}</p>
                </div>
              )}
              {account?.lastname && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Name:</span>
                  <p className="text-sm text-gray-900">{account.lastname}</p>
                </div>
              )}
              {account?.email && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-sm text-gray-900">{account.email}</p>
                </div>
              )}
              {account?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <p className="text-sm text-gray-900">{account.phone}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Account Type:</span>
                <p className="text-sm text-gray-900">
                  {account?.is_agent ? 'Agent' : account?.is_customer ? 'Customer' : account?.is_superadmin ? 'Admin' : 'User'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Verified:</span>
                <p className="text-sm text-gray-900">{account?.is_verified ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/agent/dashboard">
                <Button className="w-full justify-start" variant="outline">
                  Agent Dashboard
                </Button>
              </Link>
              <Link href="/agent/listProperty">
                <Button className="w-full justify-start" variant="outline">
                  List New Property
                </Button>
              </Link>
              <Link href="/explore">
                <Button className="w-full justify-start" variant="outline">
                  Explore Properties
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" disabled>
                Edit Profile (Coming Soon)
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                Privacy Settings (Coming Soon)
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                Notification Preferences (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
