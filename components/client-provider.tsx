"use client";

import { ApolloProvider } from "@apollo/client";
import { useMemo, type ReactNode } from "react";
import createApolloClient from "@/lib/apollo-client"; // << factory fn

interface ClientProviderProps {
  children: ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  // create the client only once per mount
  const client = useMemo(() => createApolloClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
