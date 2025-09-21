import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth-utils";

// Server-side Apollo Client for secure API calls
let serverApolloClient: ApolloClient<NormalizedCacheObject> | null = null;

// Auth link for server-side to add JWT token from cookies
const authLink = setContext(async (_, { headers }) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
    
    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        // Add Authorization header with JWT token if available
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    };
  } catch (error) {
    console.warn('Unable to get auth token from cookies:', error);
    return { headers };
  }
});

const httpLink = createHttpLink({
  // Direct connection to backend GraphQL API
  uri: process.env.GRAPHQL_ENDPOINT,
  fetchOptions: { 
    cache: "default",
    credentials: "include" // Include cookies for backend session management
  },
});

function createServerApolloClient() {
  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            properties: {
              merge(_, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    ssrMode: true,
    defaultOptions: {
      query: { 
        errorPolicy: "all",
        fetchPolicy: "cache-first" // Use cache-first for static generation compatibility
      },
    },
  });
}

export function getServerApolloClient() {
  if (!serverApolloClient) {
    serverApolloClient = createServerApolloClient();
  }
  return serverApolloClient;
}
