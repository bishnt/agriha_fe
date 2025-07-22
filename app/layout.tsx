import type { ReactNode } from "react";
import "./globals.css";

import Providers from "./providers";          // Apollo + any future contexts
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "AGRIHA ‑ Find Homes, Far From Home",
  description: "",
   viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      {/* Next.js requires exactly one <body> here */}
      <body className="volumecontrol-initialized">
          <Providers>
          {/* Handles header / mobile nav + body‑class logic */}
          
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
