"use client";

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",
  // Add fetch options for better compatibility
  fetchOptions: {
    cache: "no-store",
  },
})

const authLink = setContext((_, { headers }) => {
  // Only access localStorage on the client side
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    // Add type policies for better caching
    typePolicies: {
      Query: {
        fields: {
          properties: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  // Disable SSR for Apollo Client
  ssrMode: typeof window === "undefined",
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: "all",
    },
  },
})

export default apolloClient
