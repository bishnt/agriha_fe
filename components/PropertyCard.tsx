"use client";

import Image from "next/image";

type Props = {
  title: string;
  price: string;
  location: string;
  imageUrl: string;
};

export default function PropertyCard({ title, price, location, imageUrl }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <Image 
        src={imageUrl} 
        alt={title} 
        width={400}
        height={250}
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <p className="text-gray-500 text-sm">{location}</p>
        <h3 className="text-lg font-semibold mt-1">{title}</h3>
        <p className="text-blue-700 font-bold mt-2">{price}</p>
      </div>
    </div>
  );
}