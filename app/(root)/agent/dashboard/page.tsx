// app/agent/dashboard/page.tsx
import { getUserDetails, getAgentProperties } from "@/lib/server-actions";
import AgentDashboardClient from "./AgentDashboardClient";
import { redirect } from "next/navigation";

export default async function AgentDashboard() {
  // Fetch user details server-side with authentication check
  const userResult = await getUserDetails();
  
  if (!userResult.success || !userResult.user) {
    redirect("/auth/signin");
  }

  const user = userResult.user;
  
  // Fetch user's properties server-side
  const result = await getAgentProperties(user.id.toString());
  const initialProperties = (result.success && result.data) ? result.data : [];

  return (
    <AgentDashboardClient 
      initialProperties={initialProperties}
      user={user}
    />
  );
}
