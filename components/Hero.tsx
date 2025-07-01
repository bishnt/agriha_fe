"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#f5f8ff] py-12 px-6 flex flex-col lg:flex-row items-center justify-between gap-10">
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Find Homes, <br /> <span className="text-blue-700">Far From Home</span>
        </h1>
        <div className="mt-6 flex">
          <input
            type="text"
            placeholder="Search by location, landmarks"
            className="px-4 py-2 w-full max-w-sm border border-gray-300 rounded-l-md"
          />
          <button className="bg-blue-700 text-white px-4 py-2 rounded-r-md">
            Search
          </button>
        </div>
      </div>
      <Image
        src="/hero.png"
        alt="Hero Image"
        width={400}
        height={300}
        className="w-full max-w-md rounded-lg shadow-md"
      />
    </section>
  );
}