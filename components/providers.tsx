"use client";

import { ReactNode, useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import getApolloClient from "@/lib/apollo-client";

/**
 * Wraps the whole React tree in ApolloProvider.
 * `useMemo` guarantees we create the client only once per browser tab.
 */
export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
