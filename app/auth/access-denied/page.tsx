import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock } from "lucide-react"

export default function AccessDeniedPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#002b6d] to-[#001a42] rounded-full mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#002b6d] mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-center">You do not have permission to access this page directly.</p>
          <Button asChild className="w-full">
            <Link href="/auth/register">Go to Registration</Link>
          </Button>
        </div>
      </div>
    </>
  )
}