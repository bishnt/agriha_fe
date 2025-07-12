// /app/agent/ClientSideProviders.tsx  (CLIENT component)
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';

import { Toaster } from 'sonner';

/**
 * Wraps the route tree in all client‑only providers.
 * The “mounted” gate ensures we don’t render on the server at all,
 * so the HTML is produced once and never re‑rendered → no mismatch.
 */
export default function ClientSideProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;      // skip SSR for this subtree

  // Create Apollo Client instance
  const client = new ApolloClient({
    uri: '/api/graphql', // Change this URI to your GraphQL endpoint
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      {children}
      <Toaster richColors />
    </ApolloProvider>
  );
}
