import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { BookingForm } from "@/components/rides/booking-form"
import { RideStatusBadge, SeatsBadge } from "@/components/rides/status-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { bookSeats } from "@/lib/actions/booking"
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatSeats,
  nowLocal,
} from "@/lib/format"
import { getRide, isBookable } from "@/lib/rides"
import type { Ride } from "@/lib/types"
import { MAX_SEATS_PER_BOOKING, parseId } from "@/lib/validation"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ cursa_id: string }> }

async function loadRide(params: Props["params"]): Promise<Ride> {
  const id = parseId((await params).cursa_id)
  const ride = id ? await getRide(id) : null
  if (!ride) notFound()
  return ride
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ride = await loadRide(params)
  return {
    title: `${ride.origin} – ${ride.destination}, ${formatDateTime(ride.departureAt)}`,
  }
}

function unavailableReason(ride: Ride): string {
  if (ride.status === "CANCELLED") return "Această cursă a fost anulată."
  if (ride.status === "COMPLETED" || ride.departureAt <= nowLocal()) {
    return "Această cursă a plecat deja."
  }
  return "Nu mai există locuri disponibile pentru această cursă."
}

export default async function RideDetailsPage({ params }: Props) {
  const ride = await loadRide(params)
  const bookable = isBookable(ride)

  const details = [
    { label: "Plecare", value: formatDateTime(ride.departureAt) },
    { label: "Sosire estimată", value: formatDateTime(ride.arrivalAt) },
    {
      label: "Durată estimată",
      value: formatDuration(ride.departureAt, ride.arrivalAt),
    },
    { label: "Preț bilet", value: formatPrice(ride.price) },
    {
      label: "Locuri disponibile",
      value: `${formatSeats(ride.availableSeats)} din ${ride.capacity}`,
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/cursa" />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Toate cursele
      </Button>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-x-2 text-xl">
              {ride.origin}
              <ArrowRightIcon className="size-5 text-muted-foreground" />
              {ride.destination}
            </CardTitle>
            <CardDescription>Cursa #{ride.id}</CardDescription>
            <CardAction className="flex flex-wrap justify-end gap-1">
              {ride.status === "ACTIVE" ? (
                <SeatsBadge ride={ride} />
              ) : (
                <RideStatusBadge status={ride.status} />
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3">
              {details.map((item, index) => (
                <div key={item.label} className="flex flex-col gap-3">
                  {index > 0 && <Separator />}
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium first-letter:uppercase">
                      {item.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rezervă locuri</CardTitle>
            <CardDescription>
              Completează datele pasagerului principal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm
              action={bookSeats.bind(null, ride.id)}
              maxSeats={Math.min(ride.availableSeats, MAX_SEATS_PER_BOOKING)}
              unavailableReason={bookable ? undefined : unavailableReason(ride)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
