import { BusFrontIcon } from "lucide-react"

import { RideCard } from "@/components/rides/ride-card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { Ride } from "@/lib/types"

export function RideList({
  rides,
  emptyTitle = "Nu există curse disponibile",
  emptyDescription = "Revino în curând pentru curse noi.",
}: {
  rides: Ride[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (rides.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BusFrontIcon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}
    </div>
  )
}
