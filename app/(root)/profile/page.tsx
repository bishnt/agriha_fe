import ProfileClient from './ProfileClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <ProfileClient />;
}
