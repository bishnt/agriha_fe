import type { ReactNode } from "react"
import { ApolloProvider } from "@apollo/client"
import apolloClient from "@/lib/apollo-client"
import "./globals.css"
import { Inter } from "next/font/google"

// Load Inter with all required weights. It gets embedded automatically,
// avoiding any external fetch in the sandbox.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
