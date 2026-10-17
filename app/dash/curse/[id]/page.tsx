import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

import { BookingsTable } from "@/components/dash/bookings-table"
import { DeleteRideDialog } from "@/components/dash/delete-ride-dialog"
import { RideForm } from "@/components/dash/ride-form"
import { RideStatusBadge } from "@/components/rides/status-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateRideAction } from "@/lib/actions/admin"
import { requireAdmin } from "@/lib/auth"
import { listBookingsForRide } from "@/lib/bookings"
import { formatDateTime } from "@/lib/format"
import { getRide } from "@/lib/rides"
import { parseId } from "@/lib/validation"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Cursa #${(await params).id}` }
}

export default async function EditRidePage({ params }: Props) {
  await requireAdmin()

  const id = parseId((await params).id)
  const ride = id ? await getRide(id) : null
  if (!ride) notFound()
  const bookings = await listBookingsForRide(ride.id)

  const seatStats = [
    { label: "Capacitate", value: ride.capacity },
    { label: "Confirmate", value: ride.confirmedSeats },
    { label: "În așteptare", value: ride.pendingSeats },
    { label: "Libere", value: ride.availableSeats },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/dash" />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Înapoi la panou
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {ride.origin} → {ride.destination}
            </h1>
            <RideStatusBadge status={ride.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Cursa #{ride.id} · {formatDateTime(ride.departureAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/cursa/${ride.id}`} target="_blank" />}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Pagina publică
          </Button>
          <DeleteRideDialog rideId={ride.id} bookingCount={bookings.length} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {seatStats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rezervări</CardTitle>
          <CardDescription>
            Rezervările în așteptare blochează locurile până la confirmare sau
            respingere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalii cursă</CardTitle>
        </CardHeader>
        <CardContent>
          <RideForm
            action={updateRideAction.bind(null, ride.id)}
            ride={ride}
            submitLabel="Salvează modificările"
          />
        </CardContent>
      </Card>
    </>
  )
}
