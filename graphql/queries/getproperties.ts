import { gql } from '@apollo/client';

export const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      id
      title
      price
      location
      imageUrl
    }
  }
`;
