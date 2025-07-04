// components/MobileNavBar.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const MobileNavBar: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center sm:hidden p-3 bg-white rounded-3xl shadow-xl max-w-[90%] w-full">
      <nav className="w-full"> {/* Inner nav to manage content width */}
        <ul className="flex justify-around w-full">
          {/* Home Item */}
          <li className="flex justify-center items-center">
            <Link href="/" className="flex flex-col items-center text-white font-bold text-xs transition-colors duration-300">
              <div className="flex flex-col items-center justify-center w-[84px] h-[48px] bg-[#0B316F] rounded-[32px]">
                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
                </svg>
                <span className="text-[10px] mt-1">Home</span>
              </div>
            </Link>
          </li>

          {/* Explore Item */}
          <li className="flex justify-center items-center">
            <Link href="/explore" className="flex flex-col items-center text-gray-600 text-xs transition-colors duration-300">
              <div className="w-12 h-12 flex justify-center items-center rounded-full mb-1">
                <svg className="w-6 h-6 fill-current text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
                </svg>
              </div>
            </Link>
          </li>

          {/* Map View Item */}
          <li className="flex justify-center items-center">
            <Link href="/map" className="flex flex-col items-center text-gray-600 text-xs transition-colors duration-300">
              <div className="w-12 h-12 flex justify-center items-center rounded-full mb-1">
                <svg className="w-6 h-6 fill-current text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.5 3L15 5.5L9.5 3L4 5.5L4 18.5L9.5 16L15 18.5L20.5 16V3ZM15 17L9.5 14.5L9.5 6.5L15 9L15 17Z"/>
                </svg>
              </div>
            </Link>
          </li>

          {/* Profile Item */}
          <li className="flex justify-center items-center">
            <Link href="/userprofile" className="flex flex-col items-center text-gray-600 text-xs transition-colors duration-300">
              <div className="w-12 h-12 flex justify-center items-center rounded-full overflow-hidden mb-1">
                <Image
                  src="/path/to/your/profile-pic.jpg" // REMEMBER TO UPDATE THIS PATH with data from your GraphQL backend
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MobileNavBar;