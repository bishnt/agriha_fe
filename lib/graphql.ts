import { gql } from "@apollo/client";

/**
 * Re‑usable fragment so every query/mutation stays in sync
 * with the source of truth defined in `types.ts`.
 */
export const PROPERTY_FIELDS = gql`
  fragment PropertyFields on Property {
    id
    title
    propertyName
    propertyType
    type
    description
    price
    priceType
    isForRent
    isForSale
    bedrooms
    bathrooms
    isAttached
    kitchen
    floor
    furnishing
    area
    city
    state
    country
    address
    landmark
    latitude
    longitude
    status
    isActive
    isFeatured
    isLiked
    imageUrl
    views
    createdAt
    updatedAt
  }
`;

// ────────────────────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────────────────────

export const CREATE_PROPERTY_MUTATION = gql`
  mutation CreateProperty($input: PropertyInput!) {
    createProperty(input: $input) {
      ...PropertyFields
    }
  }
  ${PROPERTY_FIELDS}
`;

export const UPDATE_PROPERTY_MUTATION = gql`
  mutation UpdateProperty($id: ID!, $input: PropertyInput!) {
    updateProperty(id: $id, input: $input) {
      ...PropertyFields
    }
  }
  ${PROPERTY_FIELDS}
`;

export const DELETE_PROPERTY_MUTATION = gql`
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id) {
      success
      message
    }
  }
`;

// ────────────────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────────────────

export const GET_AGENT_PROPERTIES_QUERY = gql`
  query GetAgentProperties($agentId: ID!) {
    agentProperties(agentId: $agentId) {
      ...PropertyFields
    }
  }
  ${PROPERTY_FIELDS}
`;

export const GET_ALL_PROPERTIES_QUERY = gql`
  query GetAllProperties($limit: Int, $offset: Int, $filters: PropertyFilters) {
    properties(limit: $limit, offset: $offset, filters: $filters) {
      ...PropertyFields
    }
  }
  ${PROPERTY_FIELDS}
`;
