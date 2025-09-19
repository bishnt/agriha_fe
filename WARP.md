# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AGRIHA is a real estate platform frontend built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It's a full-stack application featuring property listings, map-based exploration, agent dashboards, and property management capabilities with GraphQL integration.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run Next.js linting
```

### GraphQL Code Generation
```bash
npx graphql-codegen  # Generate TypeScript types from GraphQL schema
```

The GraphQL codegen watches for schema changes from the backend (default: http://localhost:4000/graphql) and generates types in `generated/graphql.ts`.

## Architecture Overview

### Project Structure
- **Next.js 15 App Router**: Uses the new app directory structure with route groups
- **GraphQL Integration**: Apollo Client with custom proxy routing and server-side rendering
- **Component Architecture**: Separation between client and server components with proper data fetching patterns
- **Styling**: Tailwind CSS with Radix UI components and shadcn/ui design system

### Key Architectural Patterns

#### 1. GraphQL Data Layer
- **Client-side**: Apollo Client with custom HTTP link and auth handling
- **Server-side**: Separate server Apollo client for SSR/SSG operations  
- **Proxy Pattern**: `/api/graphql` route proxies to backend GraphQL endpoint with CORS handling
- **Code Generation**: TypeScript types auto-generated from GraphQL schema

#### 2. Authentication Flow
- Token-based authentication with cookie support
- Server actions handle auth operations (`login`, `socialLogin`, etc.)
- Auth context flows through both client and server components

#### 3. Route Organization
```
app/
├── (root)/           # Main application routes
│   ├── page.tsx      # Homepage with property listings
│   ├── explore/      # Map-based property exploration
│   ├── agent/        # Agent dashboard and property management
│   ├── profile/      # User profiles
│   └── property/[id]/ # Individual property pages
├── auth/             # Authentication pages
└── api/graphql/      # GraphQL proxy endpoint
```

#### 4. Data Fetching Patterns
- **Server Components**: Use `server-actions.ts` for initial data fetching
- **Client Components**: Use Apollo hooks for real-time updates and mutations
- **Hybrid Approach**: Server-side initial data with client-side hydration

#### 5. Type Safety
- GraphQL schema generates TypeScript types automatically
- Custom interfaces in `lib/types.ts` for component props and business logic
- Strict TypeScript configuration with path mapping (`@/*`)

### Critical Implementation Details

#### Property Data Normalization
The application handles property data from multiple backend sources with normalization in `server-actions.ts`. The `getAllProperties()` function maps various backend response shapes to a consistent `Property` interface.

#### Map Integration
Uses Leaflet with React Leaflet for interactive property maps. Property coordinates drive both list and map views with shared state management.

#### State Management
- Apollo Client cache for GraphQL data
- React hook state for UI interactions
- Custom hooks like `useActiveProperty` for cross-component state

#### Development Environment
- **Node.js**: Requires >= 18.0.0
- **Environment Variables**: 
  - `GRAPHQL_ENDPOINT` for backend API
  - `GRAPHQL_SCHEMA_URL` for codegen (optional, defaults to localhost:4000)

## Component Guidelines

### Server vs Client Components
- Use server components for initial data fetching and SEO-critical content
- Client components for interactive features, forms, and real-time updates
- Wrap client-interactive parts with `"use client"` directive

### Data Fetching Best Practices
- Server actions for form submissions and mutations requiring revalidation
- Apollo queries for client-side data fetching with caching
- Combine server-side initial data with client-side hydration for optimal UX

### GraphQL Operations
- Queries and mutations are defined in `lib/graphql.ts`
- Use generated hooks from `generated/graphql.ts` for type-safe operations
- Implement error handling for both network and GraphQL errors

## Environment Setup

Ensure these environment variables are configured:
- `GRAPHQL_ENDPOINT`: Backend GraphQL API URL
- `NODE_ENV`: Set to 'development' for debug logging

The application uses cookie-based session management and forwards authentication headers through the GraphQL proxy.