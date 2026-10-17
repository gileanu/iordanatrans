import Link from "next/link"
import { InboxIcon } from "lucide-react"

import { BookingActions } from "@/components/dash/booking-actions"
import { BookingStatusBadge } from "@/components/rides/status-badges"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime, formatTimestamp } from "@/lib/format"
import type { Booking, BookingWithRide } from "@/lib/types"

export function BookingsTable({
  bookings,
}: {
  bookings: (Booking | BookingWithRide)[]
}) {
  if (bookings.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>Nu există rezervări</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  const showRide = bookings.some((booking) => "ride" in booking)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pasager</TableHead>
          {showRide && <TableHead>Cursă</TableHead>}
          <TableHead className="text-right">Locuri</TableHead>
          <TableHead>Data rezervării</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>
              <div className="font-medium">{booking.passengerName}</div>
              <div className="text-muted-foreground">
                <a href={`mailto:${booking.email}`}>{booking.email}</a>
              </div>
              <div className="text-muted-foreground">
                <a href={`tel:${booking.phone.replace(/\s/g, "")}`}>
                  {booking.phone}
                </a>
              </div>
            </TableCell>
            {"ride" in booking && (
              <TableCell>
                <Link
                  href={`/dash/curse/${booking.rideId}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {booking.ride.origin} → {booking.ride.destination}
                </Link>
                <div className="text-muted-foreground">
                  {formatDateTime(booking.ride.departureAt)}
                </div>
              </TableCell>
            )}
            <TableCell className="text-right tabular-nums">
              {booking.seats}
            </TableCell>
            <TableCell>{formatTimestamp(booking.createdAt)}</TableCell>
            <TableCell>
              <BookingStatusBadge status={booking.status} />
            </TableCell>
            <TableCell>
              <BookingActions booking={booking} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
