import Link from "next/link"
import { ArrowRightIcon, CalendarIcon, ClockIcon, UsersIcon } from "lucide-react"

import { SeatsBadge } from "@/components/rides/status-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatDate,
  formatDuration,
  formatPrice,
  formatSeats,
  formatTime,
} from "@/lib/format"
import type { Ride } from "@/lib/types"

export function RideCard({ ride }: { ride: Ride }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-x-2">
          {ride.origin}
          <ArrowRightIcon className="size-4 text-muted-foreground" />
          {ride.destination}
        </CardTitle>
        <CardDescription className="first-letter:uppercase">
          {formatDate(ride.departureAt)}
        </CardDescription>
        <CardAction>
          <SeatsBadge ride={ride} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          Plecare la ora{" "}
          <span className="text-foreground">{formatTime(ride.departureAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4" />
          Durată estimată {formatDuration(ride.departureAt, ride.arrivalAt)}
        </div>
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4" />
          {ride.availableSeats === 1
            ? "1 loc disponibil"
            : `${formatSeats(ride.availableSeats)} disponibile`}{" "}
          din {ride.capacity}
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-2">
        <span className="font-heading text-base font-semibold">
          {formatPrice(ride.price)}
        </span>
        <Button nativeButton={false} render={<Link href={`/cursa/${ride.id}`} />}>
          Vezi detalii
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  )
}
