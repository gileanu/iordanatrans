export const RIDE_STATUSES = ["active", "cancelled", "completed"] as const
export type RideStatus = (typeof RIDE_STATUSES)[number]

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
  active: "Activă",
  cancelled: "Anulată",
  completed: "Finalizată",
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "În așteptare",
  confirmed: "Confirmată",
  rejected: "Respinsă",
  cancelled: "Anulată",
}

export type Ride = {
  id: number
  origin: string
  destination: string
  /** Local Romanian time, "YYYY-MM-DDTHH:mm". */
  departureAt: string
  /** Local Romanian time, "YYYY-MM-DDTHH:mm". */
  arrivalAt: string
  price: number
  capacity: number
  status: RideStatus
  /** Seats held by confirmed bookings. */
  confirmedSeats: number
  /** Seats held by bookings awaiting confirmation. */
  pendingSeats: number
  /** capacity - confirmedSeats - pendingSeats */
  availableSeats: number
}

export type Booking = {
  id: number
  rideId: number
  passengerName: string
  email: string
  phone: string
  seats: number
  status: BookingStatus
  /** UTC ISO timestamp. */
  createdAt: string
}

export type BookingWithRide = Booking & {
  ride: Pick<Ride, "origin" | "destination" | "departureAt">
}

export type RideInput = Omit<
  Ride,
  "id" | "confirmedSeats" | "pendingSeats" | "availableSeats"
>

export type BookingInput = Pick<
  Booking,
  "passengerName" | "email" | "phone" | "seats"
>

export type FormState<Field extends string = string> = {
  status?: "success" | "error"
  message?: string
  errors?: Partial<Record<Field, string>>
  values?: Partial<Record<Field, string>>
}
