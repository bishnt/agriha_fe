import { gql } from "@apollo/client"

export const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
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

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: ID!, $input: UpdatePropertyInput!) {
    updateProperty(id: $id, input: $input) {
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

export const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id)
  }
`
