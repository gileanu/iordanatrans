import "server-only"

import type { Row } from "@libsql/client"

import { getDb } from "@/lib/db"
import { nowLocal } from "@/lib/format"
import { HELD_SEATS_SQL } from "@/lib/rides"
import type {
  Booking,
  BookingInput,
  BookingStatus,
  BookingWithRide,
} from "@/lib/types"

function toBooking(row: Row): Booking {
  return {
    id: Number(row.id),
    rideId: Number(row.ride_id),
    passengerName: String(row.passenger_name),
    email: String(row.email),
    phone: String(row.phone),
    seats: Number(row.seats),
    status: row.status as BookingStatus,
    createdAt: String(row.created_at),
  }
}

export async function listBookings(): Promise<BookingWithRide[]> {
  const db = await getDb()
  const result = await db.execute(`
    SELECT b.*, r.origin, r.destination, r.departure_at
    FROM bookings b
    JOIN rides r ON r.id = b.ride_id
    ORDER BY b.status = 'pending' DESC, b.created_at DESC`)
  return result.rows.map((row) => ({
    ...toBooking(row),
    ride: {
      origin: String(row.origin),
      destination: String(row.destination),
      departureAt: String(row.departure_at),
    },
  }))
}

export async function listBookingsForRide(rideId: number): Promise<Booking[]> {
  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT * FROM bookings WHERE ride_id = ?
          ORDER BY status = 'pending' DESC, created_at DESC`,
    args: [rideId],
  })
  return result.rows.map(toBooking)
}

/**
 * Creates a pending booking in a single atomic statement: the row is only
 * inserted if the ride is active, has not departed and still has enough free
 * seats. Returns the new booking id, or null when the seats are not available.
 */
export async function createBooking(
  rideId: number,
  input: BookingInput
): Promise<number | null> {
  const db = await getDb()
  const result = await db.execute({
    sql: `INSERT INTO bookings (ride_id, passenger_name, email, phone, seats, status)
          SELECT r.id, ?, ?, ?, ?, 'pending'
          FROM rides r
          WHERE r.id = ?
            AND r.status = 'active'
            AND r.departure_at > ?
            AND r.capacity - ${HELD_SEATS_SQL} >= ?`,
    args: [
      input.passengerName,
      input.email,
      input.phone,
      input.seats,
      rideId,
      nowLocal(),
      input.seats,
    ],
  })
  return result.rowsAffected > 0 ? Number(result.lastInsertRowid) : null
}

export type BookingAction = "confirm" | "reject" | "cancel"

// Allowed status transitions. Pending bookings already hold their seats, so
// confirming one never needs a new availability check.
const TRANSITIONS: Record<
  BookingAction,
  { to: BookingStatus; from: BookingStatus[] }
> = {
  confirm: { to: "confirmed", from: ["pending"] },
  reject: { to: "rejected", from: ["pending"] },
  cancel: { to: "cancelled", from: ["pending", "confirmed"] },
}

/** Applies a status transition. Returns false if it is not allowed. */
export async function updateBookingStatus(
  id: number,
  action: BookingAction
): Promise<boolean> {
  const { to, from } = TRANSITIONS[action]
  const db = await getDb()
  const result = await db.execute({
    sql: `UPDATE bookings SET status = ?
          WHERE id = ? AND status IN (${from.map(() => "?").join(", ")})`,
    args: [to, id, ...from],
  })
  return result.rowsAffected > 0
}
