import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone, password } = await request.json()

    // GraphQL mutation for sign in
    const graphqlQuery = {
      query: `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
            user {
              id
              email
              phone
              name
            }
          }
        }
      `,
      variables: {
        input: {
          emailOrPhone,
          password,
        },
      },
    }

    // Send to your GraphQL backend
    const response = await fetch(process.env.GRAPHQL_ENDPOINT || "http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })

    const data = await response.json()

    if (data.errors) {
      return NextResponse.json({ message: data.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      token: data.data.signIn.token,
      user: data.data.signIn.user,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
