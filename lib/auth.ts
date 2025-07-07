import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-do-not-use-in-prod",
  debug: process.env.NODE_ENV !== "production",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Send social login data to GraphQL backend
        try {
          const response = await fetch(process.env.GRAPHQL_ENDPOINT || "http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation SocialSignIn($input: SocialSignInInput!) {
                  socialSignIn(input: $input) {
                    token
                    user {
                      id
                      email
                      name
                    }
                  }
                }
              `,
              variables: {
                input: {
                  provider: account.provider,
                  providerId: account.providerAccountId,
                  email: token.email,
                  name: token.name,
                  accessToken: account.access_token,
                },
              },
            }),
          })

          const data = await response.json()

          if (data.data?.socialSignIn?.token) {
            token.accessToken = data.data.socialSignIn.token
          }
        } catch (error) {
          console.error("Social sign-in error:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        ;(session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

