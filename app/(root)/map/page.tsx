import React from 'react';
// import { auth } from '@/lib/auth';
// import { redirect } from 'next/navigation';
import MapClient from './MapClient';

export default async function MapPage() {
  // Temporarily disabled auth check for testing CRUD
  // const session = await auth();
  
  // if (!session) {
  //   redirect('/auth/signin');
  // }

  return <MapClient />;
}
