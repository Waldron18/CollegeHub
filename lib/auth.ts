import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const AUTH_COOKIE_NAME = 'collegehub_token'

const JWT_SECRET =
  process.env.JWT_SECRET || 'collegehub_super_secret_jwt_key_9f82d3a4b1c7e6_2026'
const secretKey = new TextEncoder().encode(JWT_SECRET)

export interface AuthPayload {
  id: string
  email: string
  role: string
  name: string
  prnNumber?: string | null
}

/**
 * Signs a JWT for a user session with a 7-day expiration.
 */
export async function signToken(payload: AuthPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

/**
 * Verifies a JWT and returns the parsed payload, or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as AuthPayload
  } catch (error) {
    return null
  }
}

/**
 * Helper to retrieve and verify the authenticated session from cookies in Route Handlers.
 */
export async function getAuthUser(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}
