import "server-only"

import type { Prisma } from "@/lib/generated/prisma/client"
import { nowLocal } from "@/lib/format"
import { getPrisma } from "@/lib/prisma"
import type { BookingStatus, Ride, RideInput } from "@/lib/types"

// Ride dates are wall-clock strings ("YYYY-MM-DDTHH:mm", Romanian time) stored
// in a "timestamp without time zone" column, so they round-trip through UTC.
export function toDbDate(value: string): Date {
  return new Date(`${value}:00Z`)
}

function fromDbDate(value: Date): string {
  return value.toISOString().slice(0, 16)
}

// Pending bookings hold their seats too, so confirming them can never overbook.
export const HELD_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED"]

const rideInclude = {
  bookings: {
    where: { status: { in: HELD_STATUSES } },
    select: { seats: true, status: true },
  },
} satisfies Prisma.RideInclude

type RideRow = Prisma.RideGetPayload<{ include: typeof rideInclude }>

function toRide(row: RideRow): Ride {
  let confirmedSeats = 0
  let pendingSeats = 0
  for (const booking of row.bookings) {
    if (booking.status === "CONFIRMED") confirmedSeats += booking.seats
    else pendingSeats += booking.seats
  }
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    departureAt: fromDbDate(row.departureAt),
    arrivalAt: fromDbDate(row.arrivalAt),
    price: row.price.toNumber(),
    capacity: row.capacity,
    status: row.status,
    confirmedSeats,
    pendingSeats,
    availableSeats: Math.max(0, row.capacity - confirmedSeats - pendingSeats),
  }
}

export const RIDE_SORTS = {
  "data-asc": [{ departureAt: "asc" }],
  "data-desc": [{ departureAt: "desc" }],
  "pret-asc": [{ price: "asc" }, { departureAt: "asc" }],
  "pret-desc": [{ price: "desc" }, { departureAt: "asc" }],
} satisfies Record<string, Prisma.RideOrderByWithRelationInput[]>
export type RideSort = keyof typeof RIDE_SORTS

export type RideFilters = {
  origin?: string
  destination?: string
  /** "YYYY-MM-DD" */
  date?: string
  sort?: RideSort
  limit?: number
}

/** Active rides that have not departed yet. */
export async function listUpcomingRides(
  filters: RideFilters = {}
): Promise<Ride[]> {
  const departureAt: Prisma.DateTimeFilter = { gt: toDbDate(nowLocal()) }
  if (filters.date) {
    const dayStart = toDbDate(`${filters.date}T00:00`)
    departureAt.gte = dayStart
    departureAt.lt = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
  }

  const rows = await getPrisma().ride.findMany({
    where: {
      status: "ACTIVE",
      departureAt,
      origin: filters.origin
        ? { contains: filters.origin, mode: "insensitive" }
        : undefined,
      destination: filters.destination
        ? { contains: filters.destination, mode: "insensitive" }
        : undefined,
    },
    orderBy: RIDE_SORTS[filters.sort ?? "data-asc"],
    take: filters.limit,
    include: rideInclude,
  })
  return rows.map(toRide)
}

export async function listAllRides(): Promise<Ride[]> {
  const rows = await getPrisma().ride.findMany({
    orderBy: { departureAt: "desc" },
    include: rideInclude,
  })
  return rows.map(toRide)
}

export async function getRide(id: number): Promise<Ride | null> {
  const row = await getPrisma().ride.findUnique({
    where: { id },
    include: rideInclude,
  })
  return row ? toRide(row) : null
}

/** Whether new bookings can be made for the ride right now. */
export function isBookable(ride: Ride): boolean {
  return (
    ride.status === "ACTIVE" &&
    ride.departureAt > nowLocal() &&
    ride.availableSeats > 0
  )
}

function toDbData(input: RideInput) {
  return {
    origin: input.origin,
    destination: input.destination,
    departureAt: toDbDate(input.departureAt),
    arrivalAt: toDbDate(input.arrivalAt),
    price: input.price,
    capacity: input.capacity,
    status: input.status,
  }
}

export async function createRide(input: RideInput): Promise<number> {
  const ride = await getPrisma().ride.create({ data: toDbData(input) })
  return ride.id
}

/** Locks the ride row until the end of the transaction. */
export async function lockRide(
  tx: Prisma.TransactionClient,
  id: number
): Promise<boolean> {
  const rows = await tx.$queryRaw<{ id: number }[]>`
    SELECT id FROM "Ride" WHERE id = ${id} FOR UPDATE`
  return rows.length > 0
}

/** Seats held by pending and confirmed bookings of a ride. */
export async function heldSeats(
  tx: Prisma.TransactionClient,
  rideId: number
): Promise<number> {
  const result = await tx.booking.aggregate({
    where: { rideId, status: { in: HELD_STATUSES } },
    _sum: { seats: true },
  })
  return result._sum.seats ?? 0
}

/**
 * Updates a ride. Returns false when the new capacity would be lower than the
 * seats already held by pending and confirmed bookings (or the ride is gone).
 */
export async function updateRide(
  id: number,
  input: RideInput
): Promise<boolean> {
  return getPrisma().$transaction(async (tx) => {
    if (!(await lockRide(tx, id))) return false
    if (input.capacity < (await heldSeats(tx, id))) return false
    await tx.ride.update({ where: { id }, data: toDbData(input) })
    return true
  })
}

/** Deletes a ride; its bookings are removed by the cascading foreign key. */
export async function deleteRide(id: number): Promise<void> {
  await getPrisma().ride.deleteMany({ where: { id } })
}
