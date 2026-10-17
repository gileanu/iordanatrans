import "server-only"

import { mkdirSync } from "node:fs"
import { createClient, type Client } from "@libsql/client"

// Local: SQLite file on disk. Serverless (e.g. Vercel): set DATABASE_URL to a
// remote libSQL/Turso database, since the filesystem there is not persistent.
const url = process.env.DATABASE_URL ?? "file:data/iordanatrans.db"
const authToken = process.env.DATABASE_AUTH_TOKEN

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_at TEXT NOT NULL,
    arrival_at TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    passenger_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    seats INTEGER NOT NULL CHECK (seats > 0),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`,
  `CREATE INDEX IF NOT EXISTS bookings_ride_id_idx ON bookings (ride_id)`,
  `CREATE INDEX IF NOT EXISTS rides_departure_at_idx ON rides (departure_at)`,
]

async function init(): Promise<Client> {
  if (url.startsWith("file:")) {
    const dir = url.slice("file:".length).split("/").slice(0, -1).join("/")
    if (dir) mkdirSync(dir, { recursive: true })
  }

  const client = createClient({ url, authToken })
  await client.batch(SCHEMA, "write")
  return client
}

// Reuse a single client across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Promise<Client> }

export function getDb(): Promise<Client> {
  if (!globalForDb.db) {
    globalForDb.db = init().catch((error) => {
      globalForDb.db = undefined
      throw error
    })
  }
  return globalForDb.db
}
