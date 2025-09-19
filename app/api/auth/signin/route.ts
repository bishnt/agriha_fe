import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone, password } = await request.json()

    // MOCK: If phone and password match, return mock user
    if ((emailOrPhone === "9813522044" || emailOrPhone === "+9813522044") && password === "Bishrant") {
      return NextResponse.json({
        token: "mock-token-9813522044",
        user: {
          id: "1",
          email: null,
          phone: "9813522044",
          name: "bishrant"
        }
      })
    }
    // NEW MOCK: 9800000000 and Bishrant
    if ((emailOrPhone === "9800000000" || emailOrPhone === "+9800000000") && password === "Bishrant") {
      return NextResponse.json({
        token: "mock-token-9800000000",
        user: {
          id: "2",
          email: null,
          phone: "9800000000",
          name: "bishrant"
        }
      })
    }

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
    const response = await fetch(process.env.GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql", {
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
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
