import { getUserDetails } from "@/lib/server-actions";
import ProfileClient from './ProfileClient';
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // Fetch user details server-side with authentication check
  const userResult = await getUserDetails();
  
  if (!userResult.success || !userResult.user) {
    redirect("/auth/signin");
  }

  return <ProfileClient user={userResult.user} />;
}
