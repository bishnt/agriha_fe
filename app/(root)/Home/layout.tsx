// app/(root)/Home/layout.tsx

import React from 'react';

// You can import components specific to your Home section here if needed
// import HomeHeader from './HomeHeader';
// import HomeSidebar from './HomeSidebar';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* This section acts as a wrapper for the content of app/(root)/Home/page.tsx */}
      {/* You can add elements here that should appear on all pages within the /Home route,
          e.g., a specific header, sidebar, or footer for this section of your app. */}
      {children}
    </section>
  );
}