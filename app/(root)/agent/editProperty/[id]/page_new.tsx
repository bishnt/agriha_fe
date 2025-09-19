import React from 'react';
import { getUserDetails, getPropertyById } from '@/lib/server-actions';
import EditPropertyClient from './EditPropertyClient';
import { redirect } from 'next/navigation';

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  // Await params to get the id
  const { id } = await params;
  // Fetch user details server-side with authentication check
  const userResult = await getUserDetails();
  
  if (!userResult.success || !userResult.user) {
    redirect("/auth/signin");
  }

  // const user = userResult.user; // Unused for now
  
  // Fetch property details
  const propertyResult = await getPropertyById(id);
  
  if (!propertyResult.success || !propertyResult.data) {
    redirect("/agent/dashboard");
  }

  const property = propertyResult.data;

  return <EditPropertyClient property={property} />;
}