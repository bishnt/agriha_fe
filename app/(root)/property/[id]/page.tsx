import { notFound } from "next/navigation";
import { getPropertyById, getPropertyReviews, getPropertyAverageRating } from "@/lib/server-actions";
import PropertyDetailsClient from "@/app/(root)/property/[id]/PropertyDetailsClient";

interface PropertyDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id } = await params;

  // Fetch property data server-side
  const [propertyResult, reviewsResult, ratingResult] = await Promise.all([
    getPropertyById(id),
    getPropertyReviews(id),
    getPropertyAverageRating(id)
  ]);

  if (!propertyResult.success || !propertyResult.data) {
    notFound();
  }

  const property = propertyResult.data;
  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const averageRating = ratingResult.success ? ratingResult.data : 0;

  return (
    <PropertyDetailsClient 
      property={property}
      reviews={reviews}
      averageRating={averageRating}
    />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyDetailsPageProps) {
  const { id } = await params;
  const result = await getPropertyById(id);
  
  if (!result.success || !result.data) {
    return {
      title: "Property Not Found - AGRIHA",
      description: "The requested property could not be found."
    };
  }

  const property = result.data;
  
  return {
    title: `${property.title} - ${property.city}, ${property.state} | AGRIHA`,
    description: `${property.description?.slice(0, 160) || `${property.bedrooms} bedroom ${property.type.toLowerCase()} for ${property.isForRent ? 'rent' : 'sale'} in ${property.city}`}`,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.imageUrl ? [property.imageUrl] : [],
    },
  };
}
