import { Progress } from "@/components/ui/progress"
import type { Ride } from "@/lib/types"

export function SeatUsage({ ride }: { ride: Ride }) {
  const held = ride.confirmedSeats + ride.pendingSeats
  return (
    <div className="flex min-w-36 flex-col gap-1.5">
      <div className="flex justify-between gap-2 tabular-nums">
        <span>
          {held} / {ride.capacity}
        </span>
        <span className="text-muted-foreground">{ride.availableSeats} libere</span>
      </div>
      <Progress
        value={Math.round((held / ride.capacity) * 100)}
        aria-label="Grad de ocupare"
      />
      {ride.pendingSeats > 0 && (
        <span className="text-xs text-muted-foreground">
          {ride.pendingSeats} în așteptare
        </span>
      )}
    </div>
  )
}
