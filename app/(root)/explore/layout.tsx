// app/(explore)/layout.tsx   ← adjust the path to match your route segment

import type { ReactNode } from "react"

/**
 * Prevents viewport scrolling on mobile by:
 *   • pinning the wrapper to 100 dvh (handles iOS address‑bar shrink/expand)
 *   • hiding overflow so only internal scroll areas (e.g. the list in MobilePanel) can scroll
 * On ≥ md screens it falls back to the usual min‑height plus normal scrolling.
 */
export default function ExploreLayout({ children }: { children: ReactNode }) {
  return (
    <html>
          <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>AGRIHA ‑ Find Homes, Far From Home</title>
      </head>
    <div className="h-[100dvh] overflow-hidden md:min-h-screen md:overflow-auto bg-[#F8F8FF]">
      {children}
    </div>
    </html>
  )
}
