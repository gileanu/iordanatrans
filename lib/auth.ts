import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { DUMMY_HASH, verifyPassword } from "@/lib/password"
import { getPrisma } from "@/lib/prisma"

// Admins are users with role ADMIN and a passwordHash, set in Prisma Studio.
// Sessions are HMAC-signed cookies (SESSION_SECRET, min. 32 characters); the
// role is re-checked on every request, so demoting a user revokes access.

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

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
}

/** Returns the admin's id when the credentials are valid. */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<number | null> {
  const user = await getPrisma().user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, role: true, passwordHash: true },
  })
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  return valid && user?.role === "ADMIN" ? user.id : null
}

export async function createSession(userId: number): Promise<void> {
  const payload = `${userId}.${Date.now() + SESSION_MAX_AGE * 1000}`
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
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

/** The signed-in admin, or null. Cached for the duration of a request. */
export const getAdmin = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const [userId, expiresAt, signature] = token.split(".")
  if (!userId || !expiresAt || !signature) return null
  if (!safeEqual(signature, sign(`${userId}.${expiresAt}`))) return null
  if (Number(expiresAt) <= Date.now()) return null

  const user = await getPrisma().user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, name: true, email: true, role: true },
  })
  return user?.role === "ADMIN" ? user : null
})

export async function isAdmin(): Promise<boolean> {
  return (await getAdmin()) !== null
}

/** Use at the top of every admin page and Server Action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/dash/login")
  }
}
