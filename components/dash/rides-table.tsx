import Link from "next/link"
import { BusFrontIcon, PencilIcon } from "lucide-react"

import { SeatUsage } from "@/components/dash/seat-usage"
import { RideStatusBadge } from "@/components/rides/status-badges"
import { Button } from "@/components/ui/button"
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
import { formatDateTime, formatPrice } from "@/lib/format"
import type { Ride } from "@/lib/types"

export function RidesTable({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BusFrontIcon />
          </EmptyMedia>
          <EmptyTitle>Nu există curse</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cursă</TableHead>
          <TableHead>Plecare</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Locuri ocupate</TableHead>
          <TableHead className="text-right">Preț</TableHead>
          <TableHead className="text-right">Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rides.map((ride) => (
          <TableRow key={ride.id}>
            <TableCell>
              <div className="font-medium">
                {ride.origin} → {ride.destination}
              </div>
              <div className="text-muted-foreground">#{ride.id}</div>
            </TableCell>
            <TableCell>{formatDateTime(ride.departureAt)}</TableCell>
            <TableCell>
              <RideStatusBadge status={ride.status} />
            </TableCell>
            <TableCell>
              <SeatUsage ride={ride} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPrice(ride.price)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/dash/curse/${ride.id}`} />}
              >
                <PencilIcon data-icon="inline-start" />
                Gestionează
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
