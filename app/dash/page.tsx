import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { BookingsTable } from "@/components/dash/bookings-table"
import { RidesTable } from "@/components/dash/rides-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireAdmin } from "@/lib/auth"
import { listBookings } from "@/lib/bookings"
import { nowLocal } from "@/lib/format"
import { listAllRides } from "@/lib/rides"

export default async function DashboardPage() {
  await requireAdmin()

  const [rides, bookings] = await Promise.all([listAllRides(), listBookings()])
  const now = nowLocal()
  const upcoming = rides.filter(
    (ride) => ride.status === "active" && ride.departureAt > now
  )
  const pendingCount = bookings.filter((b) => b.status === "pending").length

  const stats = [
    { label: "Curse active viitoare", value: upcoming.length },
    { label: "Rezervări în așteptare", value: pendingCount },
    {
      label: "Locuri confirmate (curse viitoare)",
      value: upcoming.reduce((sum, ride) => sum + ride.confirmedSeats, 0),
    },
    {
      label: "Locuri libere (curse viitoare)",
      value: upcoming.reduce((sum, ride) => sum + ride.availableSeats, 0),
    },
  ]

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Panou de administrare
        </h1>
        <Button nativeButton={false} render={<Link href="/dash/curse/noua" />}>
          <PlusIcon data-icon="inline-start" />
          Adaugă cursă
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <Tabs defaultValue={pendingCount > 0 ? "rezervari" : "curse"}>
        <TabsList>
          <TabsTrigger value="curse">Curse ({rides.length})</TabsTrigger>
          <TabsTrigger value="rezervari">
            Rezervări
            {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="curse" className="pt-2">
          <RidesTable rides={rides} />
        </TabsContent>
        <TabsContent value="rezervari" className="pt-2">
          <BookingsTable bookings={bookings} />
        </TabsContent>
      </Tabs>
    </>
  )
}
