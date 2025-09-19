import React from 'react';
import { getUserDetails } from '@/lib/server-actions';
import ListPropertyClient from './ListPropertyClient';
import { redirect } from 'next/navigation';

export default async function ListPropertyPage() {
  // Fetch user details server-side with authentication check
  const userResult = await getUserDetails();
  
  if (!userResult.success || !userResult.user) {
    redirect("/auth/signin");
  }

  const user = userResult.user;

  return <ListPropertyClient user={user} />;
}