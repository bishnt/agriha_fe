import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, email, firstname, lastname, password } = await request.json()
    const authHeader = request.headers.get("authorization")
    const tempToken = authHeader?.replace("Bearer ", "")

    // GraphQL mutation for completing registration
    const graphqlQuery = {
      query: `
        mutation CreateAccount($createAccountInput: CreateAccountInput!) {
          createAccount(createAccountInput: $createAccountInput) {
            success
            message
            account { id phone email firstname lastname }
          }
        }
      `,
      variables: {
        createAccountInput: { phone, email, firstname, lastname, password },
      },
    }

    // Send to your GraphQL backend
    const response = await fetch(process.env.GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify(graphqlQuery),
    })

    const data = await response.json()

    if (data.errors) {
      return NextResponse.json({ message: data.errors[0].message }, { status: 400 })
    }

    return NextResponse.json(data.data.createAccount)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
