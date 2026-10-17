import "server-only"

import type { Row } from "@libsql/client"

import { getDb } from "@/lib/db"
import { nowLocal } from "@/lib/format"
import type { Ride, RideInput, RideStatus } from "@/lib/types"

// Pending bookings hold their seats too, so confirming them can never overbook.
const RIDE_SELECT = `
  SELECT
    r.*,
    COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats END), 0) AS confirmed_seats,
    COALESCE(SUM(CASE WHEN b.status = 'pending' THEN b.seats END), 0) AS pending_seats
  FROM rides r
  LEFT JOIN bookings b ON b.ride_id = r.id`

/** Seats held (pending + confirmed) for the ride referenced by `r.id`. */
export const HELD_SEATS_SQL = `(
  SELECT COALESCE(SUM(seats), 0) FROM bookings
  WHERE ride_id = r.id AND status IN ('pending', 'confirmed')
)`

function toRide(row: Row): Ride {
  const capacity = Number(row.capacity)
  const confirmedSeats = Number(row.confirmed_seats)
  const pendingSeats = Number(row.pending_seats)
  return {
    id: Number(row.id),
    origin: String(row.origin),
    destination: String(row.destination),
    departureAt: String(row.departure_at),
    arrivalAt: String(row.arrival_at),
    price: Number(row.price),
    capacity,
    status: row.status as RideStatus,
    confirmedSeats,
    pendingSeats,
    availableSeats: Math.max(0, capacity - confirmedSeats - pendingSeats),
  }
}

export const RIDE_SORTS = {
  "data-asc": "r.departure_at ASC",
  "data-desc": "r.departure_at DESC",
  "pret-asc": "r.price ASC, r.departure_at ASC",
  "pret-desc": "r.price DESC, r.departure_at ASC",
} as const
export type RideSort = keyof typeof RIDE_SORTS

export type RideFilters = {
  origin?: string
  destination?: string
  /** "YYYY-MM-DD" */
  date?: string
  sort?: RideSort
  limit?: number
}

function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`
}

/** Active rides that have not departed yet. */
export async function listUpcomingRides(
  filters: RideFilters = {}
): Promise<Ride[]> {
  const where = ["r.status = 'active'", "r.departure_at > ?"]
  const args: (string | number)[] = [nowLocal()]

  if (filters.origin) {
    where.push("r.origin LIKE ? ESCAPE '\\'")
    args.push(likePattern(filters.origin))
  }
  if (filters.destination) {
    where.push("r.destination LIKE ? ESCAPE '\\'")
    args.push(likePattern(filters.destination))
  }
  if (filters.date) {
    where.push("substr(r.departure_at, 1, 10) = ?")
    args.push(filters.date)
  }

  let sql = `${RIDE_SELECT} WHERE ${where.join(" AND ")} GROUP BY r.id ORDER BY ${
    RIDE_SORTS[filters.sort ?? "data-asc"]
  }`
  if (filters.limit) {
    sql += " LIMIT ?"
    args.push(filters.limit)
  }

  const db = await getDb()
  const result = await db.execute({ sql, args })
  return result.rows.map(toRide)
}

export async function listAllRides(): Promise<Ride[]> {
  const db = await getDb()
  const result = await db.execute(
    `${RIDE_SELECT} GROUP BY r.id ORDER BY r.departure_at DESC`
  )
  return result.rows.map(toRide)
}

export async function getRide(id: number): Promise<Ride | null> {
  const db = await getDb()
  const result = await db.execute({
    sql: `${RIDE_SELECT} WHERE r.id = ? GROUP BY r.id`,
    args: [id],
  })
  const row = result.rows[0]
  return row ? toRide(row) : null
}

/** Whether new bookings can be made for the ride right now. */
export function isBookable(ride: Ride): boolean {
  return (
    ride.status === "active" &&
    ride.departureAt > nowLocal() &&
    ride.availableSeats > 0
  )
}

export async function createRide(input: RideInput): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: `INSERT INTO rides (origin, destination, departure_at, arrival_at, price, capacity, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.origin,
      input.destination,
      input.departureAt,
      input.arrivalAt,
      input.price,
      input.capacity,
      input.status,
    ],
  })
  return Number(result.lastInsertRowid)
}

/**
 * Updates a ride. Returns false when the new capacity would be lower than the
 * seats already held by pending and confirmed bookings (or the ride is gone).
 */
export async function updateRide(
  id: number,
  input: RideInput
): Promise<boolean> {
  const db = await getDb()
  const result = await db.execute({
    sql: `UPDATE rides AS r
          SET origin = ?, destination = ?, departure_at = ?, arrival_at = ?,
              price = ?, capacity = ?, status = ?
          WHERE r.id = ? AND ? >= ${HELD_SEATS_SQL}`,
    args: [
      input.origin,
      input.destination,
      input.departureAt,
      input.arrivalAt,
      input.price,
      input.capacity,
      input.status,
      id,
      input.capacity,
    ],
  })
  return result.rowsAffected > 0
}

/** Deletes a ride together with all of its bookings. */
export async function deleteRide(id: number): Promise<void> {
  const db = await getDb()
  await db.batch(
    [
      { sql: "DELETE FROM bookings WHERE ride_id = ?", args: [id] },
      { sql: "DELETE FROM rides WHERE id = ?", args: [id] },
    ],
    "write"
  )
}
