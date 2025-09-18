import { NextRequest, NextResponse } from "next/server"

if (!process.env.GRAPHQL_ENDPOINT) {
  throw new Error("GRAPHQL_ENDPOINT environment variable is not set");
}

const TARGET = process.env.GRAPHQL_ENDPOINT;

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
    
    // Log request details (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('GraphQL Proxy Request:', {
        target: TARGET,
        authorization: !!req.headers.get("authorization"),
        hasCookies: !!req.headers.get("cookie"),
        body: JSON.parse(body)
      });
    }

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
    }).catch(error => {
      console.error('GraphQL Proxy Fetch Error:', error);
      throw error;
    });

    const text = await resp.text()
    
    // Log response details in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const jsonResponse = JSON.parse(text);
        console.log('GraphQL Proxy Response:', {
          status: resp.status,
          hasErrors: !!jsonResponse.errors,
          hasData: !!jsonResponse.data,
        });
        if (jsonResponse.errors) {
          console.error('GraphQL Errors:', jsonResponse.errors);
        }
      } catch (e) {
        console.error('Invalid JSON response:', text);
      }
    }

    const headers = new Headers({ 
      "content-type": "application/json",
      // Add cache control to prevent caching of responses
      "cache-control": "no-store, must-revalidate"
    })
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


