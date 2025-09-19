"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import MobileNavBar from "@/components/MobileNavBar";
import { ReactNode, useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");

  /**
   * Keep <body> classes in sync *after* hydration.
   * Doing this in useEffect avoids server‑client HTML mismatches.
   */
  useEffect(() => {
    document.body.className = `${inter.className} bg-[ghost-white] sm:bg-white ${
      isAuthPage ? "overflow-hidden" : ""
    }`;
  }, [isAuthPage]);

  return (
    <>
      <Header />

      {children}

      {!isAuthPage && (
        <div className="pb-[72px] sm:pb-0">
          <MobileNavBar />
        </div>
      )}
    </>
  );
}
