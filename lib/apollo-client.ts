"use client"

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",
  fetchOptions: {
    cache: "no-store",
  },
})

const authLink = setContext((_, { headers }) => {
  // Check if we're in the browser before accessing localStorage
  let token = null
  if (typeof window !== "undefined") {
    try {
      token = localStorage.getItem("token")
    } catch (error) {
      console.warn("Could not access localStorage:", error)
    }
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

// Only create the client once
let apolloClient: ApolloClient<any> | null = null

const createApolloClient = () => {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
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
}

// Singleton pattern for client creation
const getApolloClient = () => {
  if (!apolloClient) {
    apolloClient = createApolloClient()
  }
  return apolloClient
}

export default getApolloClient()