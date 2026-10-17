import { Badge } from "@/components/ui/badge"
import { formatSeats } from "@/lib/format"
import {
  BOOKING_STATUS_LABELS,
  RIDE_STATUS_LABELS,
  type BookingStatus,
  type Ride,
  type RideStatus,
} from "@/lib/types"

const RIDE_STATUS_VARIANTS = {
  ACTIVE: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
} as const

export function RideStatusBadge({ status }: { status: RideStatus }) {
  return (
    <Badge variant={RIDE_STATUS_VARIANTS[status]}>
      {RIDE_STATUS_LABELS[status]}
    </Badge>
  )
}

const BOOKING_STATUS_VARIANTS = {
  PENDING: "secondary",
  CONFIRMED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
} as const

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={BOOKING_STATUS_VARIANTS[status]}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  )
}

export function SeatsBadge({ ride }: { ride: Ride }) {
  if (ride.availableSeats === 0) {
    return <Badge variant="destructive">Complet</Badge>
  }
  if (ride.availableSeats === 1) {
    return <Badge variant="secondary">Ultimul loc</Badge>
  }
  if (ride.availableSeats <= 5) {
    return (
      <Badge variant="secondary">
        Ultimele {formatSeats(ride.availableSeats)}
      </Badge>
    )
  }
  return (
    <Badge variant="outline">{formatSeats(ride.availableSeats)} libere</Badge>
  )
}
