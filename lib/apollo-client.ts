// lib/apollo-client.ts

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/client-integration-nextjs"; // For Server Components (RSC)

// Function to create a new Apollo Client instance.
// This function will be used by both the RSC setup and the Client Component wrapper.
function makeClient() {
  // Ensure your GraphQL API URL is correctly set.
  // It's highly recommended to use an environment variable for this.
  const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:4000/graphql";

  const httpLink = new HttpLink({
    uri: graphqlApiUrl,
    // You might add headers here, e.g., for authentication:
    // headers: {
    //   authorization: `Bearer ${YOUR_AUTH_TOKEN}`,
    // },
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    // Set to `true` to disable forceFetch on the browser side and avoid refetching
    // data that was already fetched on the server.
    ssrForceFetchDelay: 100,
  });
}

// For Server Components (RSC):
// `registerApolloClient` exports functions like `getClient`, `query`, and `PreloadQuery`
// which can be directly used in your Server Components (e.g., app/(root)/page.tsx).
export const { getClient, query, PreloadQuery } = registerApolloClient(makeClient);

// For Client Components:
// This function will be passed to `ApolloNextAppProvider` in your wrapper.
// It ensures that Client Components get a consistent Apollo Client instance.
export function makeApolloClient() {
  return makeClient(); // Simply reuse the makeClient function
}