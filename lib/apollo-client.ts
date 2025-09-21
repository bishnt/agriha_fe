/*
 * Shared Apollo Client factory.
 * ‑ No `"use client"` directive, so it can be imported
 *   from either server or client code.
 * ‑ `getApolloClient()` returns the same singleton per JS‑runtime
 *   (one instance in the browser, one per SSR worker thread).
 */

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAuthToken } from "@/lib/auth-utils";

// Create the basic HTTP link
const httpLink = createHttpLink({
  uri: typeof window !== "undefined" 
    ? "/api/graphql"  // Use local API route in the browser
    : process.env.GRAPHQL_ENDPOINT!, // Use direct endpoint on server-side
  credentials: "include", // Include cookies
});

// Auth link to add the JWT token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage/cookies if it exists
  const token = getAuthToken();
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Add Authorization header with JWT token if user is authenticated
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  };
});

/* ------------------------------------------------------------------ */
/* Singleton pattern — create once, then reuse the same client object */
/* ------------------------------------------------------------------ */

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient() {
  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            properties: {
              // overwrite, don’t merge paginated results
              merge(_, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    // Enables “no network” mode during SSR
    ssrMode: typeof window === "undefined",
    // Consistent error handling defaults
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
        notifyOnNetworkStatusChange: true,
      },
      query: { errorPolicy: "all" },
    },
  });
}

export default function getApolloClient() {
  if (!apolloClient) apolloClient = createApolloClient();
  return apolloClient;
}
