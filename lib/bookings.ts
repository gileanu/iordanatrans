import "server-only"

import type { Prisma } from "@/lib/generated/prisma/client"
import { nowLocal } from "@/lib/format"
import { getPrisma } from "@/lib/prisma"
import { heldSeats, lockRide, toDbDate } from "@/lib/rides"
import type {
  Booking,
  BookingInput,
  BookingStatus,
  BookingWithRide,
} from "@/lib/types"

const userSelect = { name: true, email: true, phone: true } as const

type BookingRow = Prisma.BookingGetPayload<{
  include: { user: { select: typeof userSelect } }
}>

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    rideId: row.rideId,
    passengerName: row.user.name,
    email: row.user.email,
    phone: row.user.phone,
    seats: row.seats,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

// Pending bookings first, then newest.
const bookingOrder: Prisma.BookingOrderByWithRelationInput[] = [
  { status: "asc" },
  { createdAt: "desc" },
]

export async function listBookings(): Promise<BookingWithRide[]> {
  const rows = await getPrisma().booking.findMany({
    orderBy: bookingOrder,
    include: {
      user: { select: userSelect },
      ride: { select: { origin: true, destination: true, departureAt: true } },
    },
  })
  return rows.map((row) => ({
    ...toBooking(row),
    ride: {
      origin: row.ride.origin,
      destination: row.ride.destination,
      departureAt: row.ride.departureAt.toISOString().slice(0, 16),
    },
  }))
}

export async function listBookingsForRide(rideId: number): Promise<Booking[]> {
  const rows = await getPrisma().booking.findMany({
    where: { rideId },
    orderBy: bookingOrder,
    include: { user: { select: userSelect } },
  })
  return rows.map(toBooking)
}

/**
 * Finds or creates the passenger (role USER) for a booking. Contact details
 * are refreshed only for regular users, never for admins.
 */
async function upsertPassenger(
  tx: Prisma.TransactionClient,
  input: BookingInput
): Promise<number> {
  const user = await tx.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      name: input.passengerName,
      phone: input.phone,
    },
    update: {},
  })
  if (user.role === "USER") {
    await tx.user.update({
      where: { id: user.id },
      data: { name: input.passengerName, phone: input.phone },
    })
  }
  return user.id
}

/**
 * Creates a pending booking. The ride row is locked for the duration of the
 * transaction, so concurrent bookings for the same ride are serialized and
 * the seat check cannot be raced. Returns the booking id, or null when the
 * ride is not bookable or does not have enough free seats.
 */
export async function createBooking(
  rideId: number,
  input: BookingInput
): Promise<number | null> {
  return getPrisma().$transaction(async (tx) => {
    if (!(await lockRide(tx, rideId))) return null

    const ride = await tx.ride.findUniqueOrThrow({
      where: { id: rideId },
      select: { status: true, departureAt: true, capacity: true },
    })
    if (ride.status !== "ACTIVE" || ride.departureAt <= toDbDate(nowLocal())) {
      return null
    }
    if (ride.capacity - (await heldSeats(tx, rideId)) < input.seats) {
      return null
    }

    const userId = await upsertPassenger(tx, input)
    const booking = await tx.booking.create({
      data: { rideId, userId, seats: input.seats },
    })
    return booking.id
  })
}

export type BookingAction = "confirm" | "reject" | "cancel"

// Allowed status transitions. Pending bookings already hold their seats, so
// confirming one never needs a new availability check.
const TRANSITIONS: Record<
  BookingAction,
  { to: BookingStatus; from: BookingStatus[] }
> = {
  confirm: { to: "CONFIRMED", from: ["PENDING"] },
  reject: { to: "REJECTED", from: ["PENDING"] },
  cancel: { to: "CANCELLED", from: ["PENDING", "CONFIRMED"] },
}

/** Applies a status transition. Returns false if it is not allowed. */
export async function updateBookingStatus(
  id: number,
  action: BookingAction
): Promise<boolean> {
  const { to, from } = TRANSITIONS[action]
  const result = await getPrisma().booking.updateMany({
    where: { id, status: { in: from } },
    data: { status: to },
  })
  return result.count > 0
}
