import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignInClient from './SignInClient';

export default async function SignInPage() {
  const session = await auth();
  
  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect('/agent/dashboard');
  }

  return <SignInClient />;
}
