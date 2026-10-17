import type { Metadata } from "next"

import { RideFilters } from "@/components/rides/ride-filters"
import { RideList } from "@/components/rides/ride-list"
import { formatCount } from "@/lib/format"
import { listUpcomingRides, RIDE_SORTS, type RideSort } from "@/lib/rides"
import { isValidDate } from "@/lib/validation"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Curse",
  description: "Toate cursele de autocar disponibile pentru rezervare.",
}

function param(value: string | string[] | undefined): string | undefined {
  const text = (Array.isArray(value) ? value[0] : value)?.trim()
  return text ? text.slice(0, 100) : undefined
}

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const origin = param(params.de_la)
  const destination = param(params.pana_la)
  const rawDate = param(params.data)
  const date = rawDate && isValidDate(rawDate) ? rawDate : undefined
  const rawSort = param(params.sortare)
  const sort: RideSort =
    rawSort && rawSort in RIDE_SORTS ? (rawSort as RideSort) : "data-asc"

  const rides = await listUpcomingRides({ origin, destination, date, sort })
  const filtered = Boolean(origin || destination || date)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Curse disponibile
        </h1>
        <p className="text-sm text-muted-foreground">
          Caută după localitate sau dată și alege cursa potrivită.
        </p>
      </div>

      <RideFilters
        origin={origin}
        destination={destination}
        date={date}
        sort={sort}
      />

      <p className="text-sm text-muted-foreground">
        {formatCount(rides.length, "cursă găsită", "curse găsite")}
      </p>

      <RideList
        rides={rides}
        emptyTitle={filtered ? "Nicio cursă găsită" : undefined}
        emptyDescription={
          filtered ? "Încearcă alte criterii de căutare." : undefined
        }
      />
    </div>
  )
}
