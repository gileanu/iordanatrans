import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/lib/generated/prisma/client"

// DATABASE_URL: Supabase connection pooler (transaction mode, port 6543).
function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL lipsește (conexiunea Supabase).")
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

// Created lazily (so builds work without env vars) and reused across hot
// reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrisma(): PrismaClient {
  globalForPrisma.prisma ??= createClient()
  return globalForPrisma.prisma
}
