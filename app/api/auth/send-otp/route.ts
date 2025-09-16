import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber } = await request.json()

    // GraphQL mutation for sending OTP
    const graphqlQuery = {
      query: `
        mutation SendOTP($sendOtpInput: sendOtpInput!) {
          sendOtp(sendOtpInput: $sendOtpInput) {
            success
            message
          }
        }
      `,
      variables: {
        sendOtpInput: { phone: mobileNumber },
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
      success: data.data.sendOtp.success,
      message: data.data.sendOtp.message,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
