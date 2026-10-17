import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Single admin account, configured only through server-side env variables:
// ADMIN_USERNAME, ADMIN_PASSWORD and SESSION_SECRET (min. 32 characters).

const SESSION_COOKIE = "iordanatrans_admin"
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET lipsește sau are mai puțin de 32 de caractere."
    )
  }
  return secret
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url")
}

/** Constant-time comparison for strings of any length. */
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest()
  const hashB = createHash("sha256").update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedUsername || !expectedPassword) return false

  const usernameOk = safeEqual(username, expectedUsername)
  const passwordOk = safeEqual(password, expectedPassword)
  return usernameOk && passwordOk
}

export async function createSession(): Promise<void> {
  const expiresAt = String(Date.now() + SESSION_MAX_AGE * 1000)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false

  const [expiresAt, signature] = token.split(".")
  if (!expiresAt || !signature) return false
  if (!safeEqual(signature, sign(expiresAt))) return false
  return Number(expiresAt) > Date.now()
}

/** Use at the top of every admin page and Server Action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/dash/login")
  }
}
