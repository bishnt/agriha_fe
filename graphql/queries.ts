import { gql } from "@apollo/client"

export const GET_PROPERTIES = gql`
  query GetProperties($filters: PropertyFilters, $limit: Int, $offset: Int) {
    properties(filters: $filters, limit: $limit, offset: $offset) {
      id
      title
      price
      currency
      priceType
      location
      bedrooms
      bathrooms
      area
      areaUnit
      isAttached
      imageUrl
      description
      amenities
    }
  }
`

export const GET_PROPERTY_BY_ID = gql`
  query GetPropertyById($id: ID!) {
    property(id: $id) {
      id
      title
      price
      currency
      priceType
      location
      bedrooms
      bathrooms
      area
      areaUnit
      isAttached
      imageUrl
      description
      amenities
      agent {
        id
        name
        email
        phone
      }
    }
  }
`

export const SEARCH_PROPERTIES = gql`
  query SearchProperties($query: String!, $limit: Int, $offset: Int) {
    searchProperties(query: $query, limit: $limit, offset: $offset) {
      id
      title
      price
      currency
      priceType
      location
      bedrooms
      bathrooms
      area
      areaUnit
      isAttached
      imageUrl
      description
    }
  }
`
