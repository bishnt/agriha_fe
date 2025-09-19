"use client";
import { ReactNode, useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import getApolloClient from "@/lib/apollo-client";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Wraps the entire React tree in ApolloProvider.
 * Ensures `useQuery` and `useMutation` always see the context.
 */
export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), []);
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApolloProvider>
  );
}
