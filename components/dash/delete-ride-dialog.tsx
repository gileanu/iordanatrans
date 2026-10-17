"use client"

import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteRideAction } from "@/lib/actions/admin"
import { formatCount } from "@/lib/format"

export function DeleteRideDialog({
  rideId,
  bookingCount,
}: {
  rideId: number
  bookingCount: number
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon data-icon="inline-start" />
        Șterge cursa
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ștergi cursa #{rideId}?</AlertDialogTitle>
          <AlertDialogDescription>
            {bookingCount > 0
              ? `Va fi ștearsă definitiv și ${formatCount(bookingCount, "rezervarea asociată", "rezervări asociate")}. `
              : ""}
            Acțiunea nu poate fi anulată. Dacă vrei doar să oprești rezervările,
            schimbă statusul cursei în „Anulată”.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Renunță</AlertDialogCancel>
          <form action={deleteRideAction}>
            <input type="hidden" name="id" value={rideId} />
            <AlertDialogAction
              type="submit"
              variant="destructive"
              className="w-full"
            >
              Șterge definitiv
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
