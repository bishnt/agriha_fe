export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface Session {
  user: User
  token: string
  expires: string
}


