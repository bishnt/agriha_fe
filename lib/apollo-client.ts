/*
 * Shared Apollo Client factory.
 * ‑ No `"use client"` directive, so it can be imported
 *   from either server or client code.
 * ‑ `getApolloClient()` returns the same singleton per JS‑runtime
 *   (one instance in the browser, one per SSR worker thread).
 */

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from "./auth-utils";

// Create the basic HTTP link
const httpLink = createHttpLink({
  uri: typeof window !== "undefined" 
    ? "/api/graphql"  // Use local API route in the browser
    : process.env.GRAPHQL_ENDPOINT!, // Use direct endpoint on server-side
  credentials: "include", // Include cookies
});

// Auth link to add the token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from auth utils
  const token = getAuthToken();

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

/* ------------------------------------------------------------------ */
/* Singleton pattern — create once, then reuse the same client object */
/* ------------------------------------------------------------------ */

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient() {
  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            properties: {
              // overwrite, don’t merge paginated results
              merge(_existing = [], incoming) {
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
