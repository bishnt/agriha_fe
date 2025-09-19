
import ExploreClient from "./ExploreClient"
import { getAllProperties } from "@/lib/server-actions"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const result = await getAllProperties()
  const properties = result.success ? result.data : undefined
  return (
    <div className="min-h-screen bg-[#F8F8FF]">
      <div className="h-[100dvh] overflow-hidden bg-[#F8F8FF]">
        <ExploreClient initialProperties={properties || []} />
      </div>
    </div>
  )
}
