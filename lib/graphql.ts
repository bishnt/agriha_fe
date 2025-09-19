import { gql } from "@apollo/client";

/**
 * Re‑usable fragment so every query/mutation stays in sync
 * with the source of truth defined in `types.ts`.
 */
export const PROPERTY_FIELDS = gql`
  fragment PropertyFields on Property {
    id
    propertyName
    propertyType
    description
    price
    isForRent
    isForSale
    bedrooms
    bathrooms
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
    createdAt
    updatedAt
  }
`;

// ────────────────────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────────────────────

export const CREATE_PROPERTY_MUTATION = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
      success
      message
      data {
        ...PropertyFields
      }
    }
  }
  ${PROPERTY_FIELDS}
`;

export const UPDATE_PROPERTY_MUTATION = gql`
  mutation UpdateProperty($id: Int!, $input: UpdatePropertyInput!) {
    updateProperty(id: $id, input: $input) {
      success
      message
      data {
        ...PropertyFields
      }
    }
  }
  ${PROPERTY_FIELDS}
`;

export const DELETE_PROPERTY_MUTATION = gql`
  mutation RemoveProperty($id: ID!) {
    removeProperty(id: $id) {
      success
      message
    }
  }
`;

// ────────────────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────────────────

export const GET_AGENT_PROPERTIES_QUERY = gql`
  query GetProperties {
    properties {
      success
      message
      data {
        items {
          ...PropertyFields
        }
        totalItems
      }
    }
  }
  ${PROPERTY_FIELDS}
`;

export const GET_ALL_PROPERTIES_QUERY = gql`
  query GetAllProperties {
    properties {
      success
      message
      data {
        items {
          ...PropertyFields
        }
        totalItems
      }
    }
  }
  ${PROPERTY_FIELDS}
`;

// ────────────────────────────────────────────────────────────────────────────────
// Auth & Profile
// ────────────────────────────────────────────────────────────────────────────────

// GET_MY_PROFILE query not supported by backend - use ACCOUNT_QUERY with specific ID instead

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: loginInput!) {
    login(loginInput: $loginInput) {
      success
      message
      accessToken
      refreshToken
    }
  }
`;

export const AUTHENTICATE_MUTATION = gql`
  mutation Authenticate($authenticateInput: authenticateInput!) {
    authenticate(authenticateInput: $authenticateInput) {
      success
      message
    }
  }
`;

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount($createAccountInput: CreateAccountInput!) {
    createAccount(createAccountInput: $createAccountInput) {
      success
      message
      account {
        id
        phone
        email
        is_verified
        firstname
        lastname
        is_customer
        is_superadmin
        is_agent
        account_created
      }
    }
  }
`;

export const SEND_OTP_MUTATION = gql`
  mutation SendOtp($sendOtpInput: sendOtpInput!) {
    sendOtp(sendOtpInput: $sendOtpInput) {
      success
      message
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($verifyOtpInput: verifyOtpInput!) {
    verifyOtp(verifyOtpInput: $verifyOtpInput) {
      success
      message
    }
  }
`;

export const UPDATE_ACCOUNT_MUTATION = gql`
  mutation UpdateAccount($updateAccountInput: UpdateAccountInput!) {
    updateAccount(updateAccountInput: $updateAccountInput) {
      success
      message
      account {
        id
        phone
        email
        is_verified
        firstname
        lastname
        is_customer
        is_superadmin
        is_agent
        account_created
      }
    }
  }
`;

export const REMOVE_ACCOUNT_MUTATION = gql`
  mutation RemoveAccount($id: Int!) {
    removeaccount(id: $id) {
      success
      message
    }
  }
`;

// Review mutations
export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
      success
      message
    }
  }
`;

export const UPDATE_REVIEW_MUTATION = gql`
  mutation UpdateReview($id: ID!, $updateReviewInput: UpdateReviewInput!) {
    updateReview(id: $id, updateReviewInput: $updateReviewInput) {
      success
      message
    }
  }
`;

export const REMOVE_REVIEW_MUTATION = gql`
  mutation RemoveReview($id: ID!) {
    removeReview(id: $id) {
      success
      message
    }
  }
`;

// Account queries
export const ACCOUNT_QUERY = gql`
  query Account($id: Int!) {
    account(id: $id) {
      success
      message
      account {
        id
        phone
        email
        is_verified
        firstname
        lastname
        is_customer
        is_superadmin
        is_agent
        account_created
      }
    }
  }
`;

export const ACCOUNTS_QUERY = gql`
  query Accounts($input: params!) {
    accounts(input: $input) {
      success
      message
      accounts {
        id
        phone
        email
        is_verified
        firstname
        lastname
        is_customer
        is_superadmin
        is_agent
        account_created
      }
    }
  }
`;

// Property queries
export const PROPERTY_QUERY = gql`
  query Property($id: Int!) {
    property(id: $id) {
      success
      message
      data {
        ...PropertyFields
      }
    }
  }
  ${PROPERTY_FIELDS}
`;

// Review queries - Updated to match backend schema
export const GET_ALL_REVIEWS_QUERY = gql`
  query GetAllReviews {
    getAllReviews {
      success
      message
    }
  }
`;

export const GET_REVIEW_BY_ID_QUERY = gql`
  query GetReviewById($id: Int!) {
    getReviewById(id: $id) {
      success
      message
    }
  }
`;

export const GET_REVIEWS_BY_PROPERTY_ID_QUERY = gql`
  query GetReviewsByPropertyId($propertyId: Int!) {
    getReviewsByPropertyId(propertyId: $propertyId) {
      success
      message
    }
  }
`;

export const CALCULATE_AVERAGE_RATING_QUERY = gql`
  query CalculateAverageRating($propertyId: String!) {
    calculateAverageRating(propertyId: $propertyId)
  }
`;
