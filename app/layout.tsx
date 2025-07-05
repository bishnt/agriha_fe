import type { ReactNode } from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import MobileNavBar from "@/components/MobileNavBar"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata = {
  title: "AGRIHA - Find Homes, Far From Home",
  description: "Real estate platform for finding rental properties",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      {/* Apply the background classes directly to the body tag */}
      <body className={`${inter.className} bg-[ghost-white] sm:bg-white`}>
        {children}
        <div className="pb-[72px] sm:pb-0">
          {/* The MobileNavBar component is included here, making it appear on all pages */}
          <MobileNavBar />
        </div>
      </body>
    </html>
  )
}
