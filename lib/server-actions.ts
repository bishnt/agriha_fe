"use server";

import { getServerApolloClient } from "@/lib/server-apollo";
import { 
  GET_AGENT_PROPERTIES_QUERY, 
  GET_ALL_PROPERTIES_QUERY,
  PROPERTY_QUERY,
  GET_REVIEWS_BY_PROPERTY_ID_QUERY,
  CALCULATE_AVERAGE_RATING_QUERY,
  CREATE_PROPERTY_MUTATION,
  UPDATE_PROPERTY_MUTATION,
  DELETE_PROPERTY_MUTATION,
  CREATE_ACCOUNT_MUTATION,
  SEND_OTP_MUTATION,
  VERIFY_OTP_MUTATION,
  UPDATE_ACCOUNT_MUTATION,
  REMOVE_ACCOUNT_MUTATION,
  CREATE_REVIEW_MUTATION,
  UPDATE_REVIEW_MUTATION,
  REMOVE_REVIEW_MUTATION,
  ACCOUNT_QUERY
} from "@/lib/graphql";
import { PropertyFormData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { login, socialLogin } from "@/lib/auth";

// Server action to get agent properties
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAgentProperties(_agentId: string) {
  try {
    const client = getServerApolloClient();
    const { data, errors } = await client.query({
      query: GET_AGENT_PROPERTIES_QUERY,
      variables: {},  // Remove agentId since the query doesn't support it yet
      fetchPolicy: 'cache-first',
    });
    
    // Use the same structure as getAllProperties since they use the same query
    const resp = (data as Record<string, unknown>)?.properties;
    
    if (!resp) {
      const errMsg = errors?.[0]?.message || "Invalid response from server";
      return { success: false, error: errMsg };
    }
    
    const respData = resp as Record<string, unknown>;
    const dataObj = respData?.data as Record<string, unknown> | undefined;
    const rawItems = dataObj?.items ?? [];
    
    // For now, return all properties (until we implement proper agent filtering)
    // In the future, this should filter by accountId === agentId
    const mapped = (rawItems as Record<string, unknown>[]).map((p) => ({
      id: Number(p.id ?? 0),
      title: String(p.propertyName ?? ""),
      propertyName: String(p.propertyName ?? ""),
      propertyType: String(p.propertyType ?? ""),
      description: String(p.description ?? ""),
      price: Number(p.price ?? 0),
      priceType: p.isForRent ? "per month" : "",
      type: String(p.propertyType ?? ""),
      isForRent: Boolean(p.isForRent),
      isForSale: Boolean(p.isForSale),
      bedrooms: Number(p.bedrooms ?? 0),
      bathrooms: Number(p.bathrooms ?? 0),
      isAttached: Boolean(p.isAttached ?? false),
      kitchen: Number(p.kitchen ?? 0),
      floor: Number(p.floor ?? 0),
      furnishing: String(p.furnishing ?? ""),
      ammenities: Array.isArray(p.amenities) ? p.amenities as string[] : [],
      area: Number(p.area ?? 0),
      areaUnit: "sqft",
      city: String(p.city ?? ""),
      state: String(p.state ?? ""),
      country: String(p.country ?? ""),
      address: String(p.address ?? ""),
      landmark: p.landmark ? String(p.landmark) : undefined,
      latitude: p.latitude ? Number(p.latitude) : undefined,
      longitude: p.longitude ? Number(p.longitude) : undefined,
      status: String(p.status ?? "available"),
      isActive: Boolean(p.isActive ?? true),
      isFeatured: Boolean(p.isFeatured ?? false),
      isLiked: false,
      createdAt: p.createdAt ? new Date(String(p.createdAt)) : new Date(),
      updatedAt: p.updatedAt ? new Date(String(p.updatedAt)) : new Date(),
      imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
      views: Number(p.views ?? 0),
    }));
    
    return { success: Boolean(respData?.success ?? true), data: mapped };
  } catch (error) {
    console.error("Error fetching agent properties:", error);
    return { success: false, error: "Failed to fetch properties" };
  }
}

// Server action to get all properties with filters
export async function getAllProperties() {
  try {
    const client = getServerApolloClient();
    const { data, errors } = await client.query({
      query: GET_ALL_PROPERTIES_QUERY,
      fetchPolicy: 'cache-first',
    });
    // Guard against undefined data shape
    const resp = (data as Record<string, unknown>)?.properties || (data as Record<string, unknown>)?.getAllProperties || null;

    // If GraphQL returned errors or no recognizable payload, surface a safe error
    if (!resp) {
      const errMsg = errors?.[0]?.message || "Invalid response from server";
      return { success: false, error: errMsg };
    }

    // Normalize items list from possible shapes
    const respData = resp as Record<string, unknown>;
    const dataObj = respData?.data as Record<string, unknown> | undefined;
    const rawItems = dataObj?.items ?? respData?.items ?? respData?.results ?? [];

    // Map backend model to UI `Property` shape expected by components
    const mapped = (rawItems as Record<string, unknown>[]).map((p) => ({
      id: Number(p.id ?? p._id ?? 0),
      title: String(p.title ?? p.propertyName ?? ""),
      propertyName: String(p.propertyName ?? p.title ?? ""),
      propertyType: String(p.propertyType ?? p.type ?? ""),
      description: String(p.description ?? ""),
      price: Number(p.price ?? 0),
      priceType: String(p.priceType ?? (p.isForRent ? "per month" : "")),
      type: String(p.type ?? p.propertyType ?? ""),
      isForRent: Boolean(p.isForRent),
      isForSale: Boolean(p.isForSale),
      bedrooms: Number(p.bedrooms ?? 0),
      bathrooms: Number(p.bathrooms ?? 0),
      isAttached: Boolean(p.isAttached ?? false),
      kitchen: Number(p.kitchen ?? 0),
      floor: Number(p.floor ?? 0),
      furnishing: String(p.furnishing ?? ""),
      ammenities: Array.isArray(p.amenities) ? p.amenities as string[] : Array.isArray(p.ammenities) ? p.ammenities as string[] : [],
      area: Number(p.area ?? 0),
      areaUnit: String(p.areaUnit ?? ""),
      city: String(p.city ?? ""),
      state: String(p.state ?? ""),
      country: String(p.country ?? ""),
      address: String(p.address ?? ""),
      landmark: p.landmark ? String(p.landmark) : undefined,
      latitude: p.latitude ? Number(p.latitude) : undefined,
      longitude: p.longitude ? Number(p.longitude) : undefined,
      status: String(p.status ?? "available"),
      isActive: Boolean(p.isActive ?? true),
      isFeatured: Boolean(p.isFeatured ?? false),
      isLiked: false,
      createdAt: p.createdAt ? new Date(String(p.createdAt)) : new Date(),
      updatedAt: p.updatedAt ? new Date(String(p.updatedAt)) : new Date(),
      imageUrl: p.imageUrl ? String(p.imageUrl) : (Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : Array.isArray(p.photos) && p.photos[0] ? String(p.photos[0]) : undefined),
      views: Number(p.views ?? 0),
    }));

    if (Array.isArray(mapped)) {
      return { success: Boolean((resp as Record<string, unknown>)?.success ?? true), data: mapped };
    }

    return { success: false, error: String((resp as Record<string, unknown>)?.message ?? "Failed to fetch properties") };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, error: "Failed to fetch properties" };
  }
}

// Server action to create a property
export async function createProperty(input: PropertyFormData) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: CREATE_PROPERTY_MUTATION,
      variables: { input },
    });
    
    revalidatePath("/agent/dashboard");
    return { success: true, data: data.createProperty };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Failed to create property" };
  }
}

// Server action to update a property
export async function updateProperty(id: string, input: PropertyFormData) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: UPDATE_PROPERTY_MUTATION,
      variables: { id, input },
    });
    
    revalidatePath("/agent/dashboard");
    revalidatePath(`/agent/editProperty/${id}`);
    return { success: true, data: data.updateProperty };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: "Failed to update property" };
  }
}

// Server action to delete a property
export async function deleteProperty(id: string) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: DELETE_PROPERTY_MUTATION,
      variables: { id },
    });
    
    revalidatePath("/agent/dashboard");
    return { success: true, data: data.removeProperty };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: "Failed to delete property" };
  }
}

// Server action to get user details with authentication check
export async function getUserDetails() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('agriha_token')?.value;
    
    if (!token) {
      return { success: false, error: "Not authenticated", user: null };
    }

    // Decode JWT to get user ID
    const { decodeJwt } = await import('@/lib/jwt');
    const payload = decodeJwt(token);
    
    if (!payload?.userId) {
      return { success: false, error: "Invalid token", user: null };
    }

    const client = getServerApolloClient();
    const { data } = await client.query({
      query: ACCOUNT_QUERY,
      variables: { id: payload.userId },
      fetchPolicy: 'network-only', // Always fetch fresh user data
    });
    
    if (data?.account?.success && data?.account?.account) {
      return { 
        success: true, 
        user: data.account.account 
      };
    } else {
      return { 
        success: false, 
        error: data?.account?.message || "Failed to fetch user details", 
        user: null 
      };
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { 
      success: false, 
      error: "Failed to fetch user details", 
      user: null 
    };
  }
}

// Authentication server actions
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const result = await login(email, password);

  if (result.success) {
    redirect("/");
  }

  return result;
}

export async function logoutAction() {
  redirect("/auth/signin");
}

export async function socialLoginAction(provider: string, accessToken: string) {
  const result = await socialLogin(provider, accessToken);

  if (result.success) {
    redirect("/");
  }

  return result;
}

// Account management server actions
export async function createAccount(input: {
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: CREATE_ACCOUNT_MUTATION,
      variables: { input },
    });
    
    return { success: true, data: data.createAccount };
  } catch (error) {
    console.error("Error creating account:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function sendOtp(input: { phone?: string; email?: string }) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: SEND_OTP_MUTATION,
      variables: { input },
    });
    
    return { success: true, data: data.sendOtp };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

export async function verifyOtp(input: { phone?: string; email?: string; otp: string; message?: string }) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: VERIFY_OTP_MUTATION,
      variables: { 
        verifyOtpInput: {
          ...input,
          message: input.message || "OTP verification request"
        }
      },
    });
    
    return { success: true, data: data.verifyOtp };
  } catch (error: unknown) {
    const err = error as { graphQLErrors?: Array<{ message: string }>; networkError?: { result?: { errors?: Array<{ message: string }> } } };
    console.error("Error verifying OTP:", error);
    
    // Log GraphQL errors for debugging
    if (err.graphQLErrors && err.graphQLErrors.length > 0) {
      console.error("GraphQL Errors:", err.graphQLErrors);
    }
    if (err.networkError?.result?.errors) {
      console.error("Network Error Details:", err.networkError.result.errors);
    }
    
    const errorMessage = err.graphQLErrors?.[0]?.message || 
                        err.networkError?.result?.errors?.[0]?.message || 
                        "Failed to verify OTP";
    
    return { success: false, error: errorMessage };
  }
}

export async function updateAccount(input: {
  phone?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: UPDATE_ACCOUNT_MUTATION,
      variables: { input },
    });
    
    revalidatePath("/profile");
    return { success: true, data: data.updateAccount };
  } catch (error) {
    console.error("Error updating account:", error);
    return { success: false, error: "Failed to update account" };
  }
}

export async function removeAccount() {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: REMOVE_ACCOUNT_MUTATION,
    });
    
    return { success: true, data: data.removeaccount };
  } catch (error) {
    console.error("Error removing account:", error);
    return { success: false, error: "Failed to remove account" };
  }
}

// Review system server actions
export async function createReview(input: {
  propertyId: string;
  rating: number;
  comment: string;
}) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: CREATE_REVIEW_MUTATION,
      variables: { input },
    });
    
    revalidatePath(`/property/${input.propertyId}`);
    return { success: true, data: data.createReview };
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, error: "Failed to create review" };
  }
}

export async function updateReview(input: {
  id: string;
  rating?: number;
  comment?: string;
}) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: UPDATE_REVIEW_MUTATION,
      variables: { input },
    });
    
    revalidatePath("/reviews");
    return { success: true, data: data.updateReview };
  } catch (error) {
    console.error("Error updating review:", error);
    return { success: false, error: "Failed to update review" };
  }
}

export async function removeReview(id: string) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: REMOVE_REVIEW_MUTATION,
      variables: { id },
    });
    
    revalidatePath("/reviews");
    return { success: true, data: data.removeReview };
  } catch (error) {
    console.error("Error removing review:", error);
    return { success: false, error: "Failed to remove review" };
  }
}

// Server action to get single property details
export async function getPropertyById(id: string) {
  try {
    const client = getServerApolloClient();
    const { data, errors } = await client.query({
      query: PROPERTY_QUERY,
      variables: { id },
      fetchPolicy: 'cache-first',
    });

    if (errors || !data?.property) {
      const errMsg = errors?.[0]?.message || "Property not found";
      return { success: false, error: errMsg };
    }

    const property = data.property.data;
    
    // Map backend property to UI format
    const mappedProperty = {
      id: Number(property.id),
      title: property.propertyName,
      propertyName: property.propertyName,
      propertyType: property.propertyType,
      description: property.description || "",
      price: Number(property.price),
      priceType: property.isForRent ? "per month" : "",
      type: property.propertyType,
      isForRent: Boolean(property.isForRent),
      isForSale: Boolean(property.isForSale),
      bedrooms: Number(property.bedrooms),
      bathrooms: Number(property.bathrooms),
      isAttached: Boolean(property.isAttached ?? false),
      kitchen: Number(property.kitchen),
      floor: Number(property.floor),
      furnishing: property.furnishing,
      ammenities: property.amenities ?? [],
      area: Number(property.area),
      areaUnit: "sqft",
      city: property.city,
      state: property.state,
      country: property.country,
      address: property.address,
      landmark: property.landmark,
      latitude: property.latitude,
      longitude: property.longitude,
      status: property.status,
      isActive: Boolean(property.isActive),
      isFeatured: Boolean(property.isFeatured),
      isLiked: false,
      createdAt: new Date(property.createdAt),
      updatedAt: new Date(property.updatedAt),
      imageUrl: property.imageUrl ?? "/images/property-interior.jpg",
      views: 0,
    };

    return { success: true, data: mappedProperty };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, error: "Failed to fetch property details" };
  }
}

// Server action to get property reviews
export async function getPropertyReviews(propertyId: string) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.query({
      query: GET_REVIEWS_BY_PROPERTY_ID_QUERY,
      variables: { propertyId },
      fetchPolicy: 'cache-first',
    });

    return { success: true, data: data.getReviewsByPropertyId || [] };
  } catch (error) {
    console.error("Error fetching property reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

// Server action to get property average rating
export async function getPropertyAverageRating(propertyId: string) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.query({
      query: CALCULATE_AVERAGE_RATING_QUERY,
      variables: { propertyId },
      fetchPolicy: 'cache-first',
    });

    return { success: true, data: data.calculateAverageRating || 0 };
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return { success: false, error: "Failed to fetch rating" };
  }
}

// Server action to send OTP
export async function sendOtpAction(mobileNumber: string) {
  try {
    const client = getServerApolloClient();
    const { data } = await client.mutate({
      mutation: SEND_OTP_MUTATION,
      variables: {
        sendOtpInput: { phone: mobileNumber }
      },
    });

    return { 
      success: data.sendOtp.success, 
      message: data.sendOtp.message 
    };
  } catch (error: unknown) {
    const err = error as { graphQLErrors?: Array<{ message: string }>; networkError?: { result?: { errors?: Array<{ message: string }> } } };
    console.error("Error sending OTP:", error);
    
    // Log GraphQL errors for debugging
    if (err.graphQLErrors && err.graphQLErrors.length > 0) {
      console.error("GraphQL Errors:", err.graphQLErrors);
    }
    if (err.networkError?.result?.errors) {
      console.error("Network Error Details:", err.networkError.result.errors);
    }
    
    const errorMessage = err.graphQLErrors?.[0]?.message || 
                        err.networkError?.result?.errors?.[0]?.message || 
                        "Failed to send OTP";
    
    return { success: false, error: errorMessage };
  }
}
