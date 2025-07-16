"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

const ActiveCtx = createContext<[number | null, (id: number) => void]>([null, () => {}])

export function ActivePropertyProvider({ children }: { children: React.ReactNode }) {
  const state = useState<number | null>(null)
  return <ActiveCtx.Provider value={state}>{children}</ActiveCtx.Provider>
}

export default function useActiveProperty() {
  return useContext(ActiveCtx)
}
