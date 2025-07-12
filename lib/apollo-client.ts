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
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
    "http://localhost:4000/graphql",
  fetchOptions: { cache: "no-store" }, // <- disable SW caching in dev
});

const authLink = setContext((_, { headers }) => {
  let token: string | null = null;

  // Access localStorage only in the browser
  if (typeof window !== "undefined") {
    try {
      token = localStorage.getItem("token");
    } catch (err) {
      console.warn("Could not read token from localStorage:", err);
    }
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

/* ------------------------------------------------------------------ */
/* Singleton pattern — create once, then reuse the same client object */
/* ------------------------------------------------------------------ */

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
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
