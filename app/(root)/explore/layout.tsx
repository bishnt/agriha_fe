"use client"

import type React from "react"

import { useEffect, useState } from "react"
import ApolloWrapper from "@/components/apollo-wrapper"

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <ApolloWrapper>{children}</ApolloWrapper>
}
