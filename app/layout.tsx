import type { ReactNode } from "react"
import "./globals.css"
import ClientLayout from "@/components/ClientLayout"

export const metadata = {
  title: "AGRIHA - Find Homes, Far From Home",
  description: "Real estate platform for finding rental properties",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
