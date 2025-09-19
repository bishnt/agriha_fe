import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, otp } = await request.json()

    // MOCK: If phone and otp match, return mock success
    if ((mobileNumber === "980000000" || mobileNumber === "+980000000") && otp === "123456") {
      return NextResponse.json({
        success: true,
        tempToken: "mock-temp-token-980000000",
        message: "OTP verified (mock)",
      })
    }

    // GraphQL mutation for verifying OTP
    const graphqlQuery = {
      query: `
        mutation VerifyOTP($verifyOtpInput: verifyOtpInput!) {
          verifyOtp(verifyOtpInput: $verifyOtpInput) {
            success
            message
          }
        }
      `,
      variables: {
        verifyOtpInput: {
          phone: mobileNumber,
          otp,
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
      success: data.data.verifyOtp.success,
      message: data.data.verifyOtp.message,
    })
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
