import { NextRequest, NextResponse } from "next/server"

const TARGET = process.env.GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql"

function cors(headers: Headers, req: NextRequest) {
  const origin = req.headers.get("origin") || "*"
  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Vary", "Origin")
  headers.set("Access-Control-Allow-Credentials", "true")
  headers.set(
    "Access-Control-Allow-Headers",
    req.headers.get("access-control-request-headers") || "content-type, authorization"
  )
  headers.set(
    "Access-Control-Allow-Methods",
    req.headers.get("access-control-request-method") || "POST, OPTIONS"
  )
}

export async function OPTIONS(req: NextRequest) {
  const headers = new Headers()
  cors(headers, req)
  return new NextResponse(null, { status: 204, headers })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    const resp = await fetch(TARGET, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // pass through auth if present
        authorization: req.headers.get("authorization") || "",
        // Forward cookies for backend session management
        cookie: req.headers.get("cookie") || "",
      },
      body,
      // avoid Next fetch caching
      cache: "no-store",
      // Include credentials for cookie forwarding
      credentials: "include",
    })

    const text = await resp.text()
    const headers = new Headers({ "content-type": "application/json" })
    cors(headers, req)
    
    // Forward Set-Cookie headers from backend to client
    const setCookie = resp.headers.get("set-cookie")
    if (setCookie) {
      headers.set("set-cookie", setCookie)
    }
    
    // Normalize status to 200 so Apollo can surface GraphQL errors from body
    const status = resp.status >= 400 ? 200 : resp.status
    return new NextResponse(text || "{}", { status, headers })
  } catch (e) {
    const headers = new Headers({ "content-type": "application/json" })
    cors(headers, req)
    return NextResponse.json({ errors: [{ message: "Proxy error" }] }, { status: 502, headers })
  }
}


