"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/">
          <span className="text-2xl font-bold text-blue-700">Agriha</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/post-property" className="text-sm text-gray-700 hover:text-blue-700">
            Post Property
          </Link>
          <Link href="/login" className="text-sm text-white bg-blue-700 px-4 py-2 rounded-md">
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}