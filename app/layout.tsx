import type { ReactNode } from "react";
import "./globals.css";

import Providers from "./providers";          // Apollo + any future contexts
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "AGRIHA ‑ Find Homes, Far From Home",
  description: "Real‑estate platform for finding rental properties",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      {/* Next.js requires exactly one <body> here */}
      <body>
        <Providers>
          {/* Handles header / mobile nav + body‑class logic */}
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
