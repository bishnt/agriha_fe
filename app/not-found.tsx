import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function NotFoundPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#002b6d] to-[#001a42] rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#002b6d] mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-6 text-center">Sorry, the page you are looking for does not exist.</p>
          <Button asChild className="w-full">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
