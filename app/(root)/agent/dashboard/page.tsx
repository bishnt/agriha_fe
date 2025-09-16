// app/agent/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { getAgentProperties } from "@/lib/server-actions";
import AgentDashboardClient from "./AgentDashboardClient";
import { redirect } from "next/navigation";

export default async function AgentDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Get agent ID from session or use a default for now
  const agentId = (session.user as any)?.id || "current-agent-id";
  
  // Fetch properties server-side
  const result = await getAgentProperties(agentId);
  const initialProperties = result.success ? result.data : [];

  return (
    <AgentDashboardClient 
      initialProperties={initialProperties}
      agentId={agentId}
    />
  );
}
