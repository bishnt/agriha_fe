import React from 'react';
// import { auth } from '@/lib/auth';
import { getAllProperties } from '@/lib/server-actions';
import HomePageClient from '@/app/(root)/HomePageClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // const isAuthenticated = !!session;
  // const session = await auth();
  
  // Fetch properties server-side
  const result = await getAllProperties();
  const initialProperties = result.success ? result.data : undefined;

  return (
    <HomePageClient 
      initialProperties={initialProperties || []} 
    />
  );
}
