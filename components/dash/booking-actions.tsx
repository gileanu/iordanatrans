import { updateBookingStatusAction } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/lib/types"

export function BookingActions({ booking }: { booking: Booking }) {
  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return null
  }

  return (
    <form action={updateBookingStatusAction} className="flex justify-end gap-1">
      <input type="hidden" name="id" value={booking.id} />
      {booking.status === "pending" ? (
        <>
          <Button size="sm" type="submit" name="action" value="confirm">
            Confirmă
          </Button>
          <Button
            size="sm"
            variant="destructive"
            type="submit"
            name="action"
            value="reject"
          >
            Respinge
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          type="submit"
          name="action"
          value="cancel"
        >
          Anulează
        </Button>
      )}
    </form>
  )
}
