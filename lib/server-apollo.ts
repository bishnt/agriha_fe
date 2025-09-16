import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from "@apollo/client";

// Server-side Apollo Client for secure API calls
let serverApolloClient: ApolloClient<NormalizedCacheObject> | null = null;

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
    link: httpLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            properties: {
              merge(_existing = [], incoming) {
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
