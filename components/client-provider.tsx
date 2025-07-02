"use client"

import { ApolloProvider } from "@apollo/client"
import apolloClient from "@/lib/apollo-client"
import type { ReactNode } from "react"

interface ClientProviderProps {
  children: ReactNode
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
