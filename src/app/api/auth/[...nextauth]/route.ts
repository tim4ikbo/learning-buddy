// API Route for NextAuth authentication
// This file imports the authentication handlers from the central auth configuration
// and exposes them as the API route for handling authentication requests.
import { handlers } from '@/auth'

export const { GET, POST } = handlers