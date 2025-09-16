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
  NormalizedCacheObject,
} from "@apollo/client";

const httpLink = createHttpLink({
  uri:
    // Prefer local proxy to avoid CORS in the browser
    (typeof window !== "undefined" ? "/api/graphql" : undefined) ||
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    process.env.GRAPHQL_ENDPOINT ||
    "http://localhost:4000/graphql",
  fetchOptions: { 
    cache: "default",
    credentials: "include" // Include cookies for backend session management
  },
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
