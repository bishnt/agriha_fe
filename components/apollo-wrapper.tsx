"use client"

import { ApolloProvider } from "@apollo/client"
import apolloClient from "@/lib/apollo-client"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

interface ApolloWrapperProps {
  children: ReactNode
}

export default function ApolloWrapper({ children }: ApolloWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
