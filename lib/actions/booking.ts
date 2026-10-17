"use server"

import { revalidatePath } from "next/cache"

import { createBooking } from "@/lib/bookings"
import { formatSeats } from "@/lib/format"
import { getRide } from "@/lib/rides"
import type { FormState } from "@/lib/types"
import { parseBookingForm, parseId, type BookingField } from "@/lib/validation"

export async function bookSeats(
  rideId: number,
  _prev: FormState<BookingField>,
  formData: FormData
): Promise<FormState<BookingField>> {
  const id = parseId(rideId)
  if (!id) return { status: "error", message: "Cursa nu există." }

  const parsed = parseBookingForm(formData)
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifică datele introduse.",
      errors: parsed.errors,
      values: parsed.values,
    }
  }

  const values = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, String(value)])
  )

  try {
    const bookingId = await createBooking(id, parsed.data)
    if (bookingId === null) {
      const ride = await getRide(id)
      let message = "Cursa nu mai este disponibilă pentru rezervări."
      if (ride && ride.status === "ACTIVE" && ride.availableSeats > 0) {
        message =
          ride.availableSeats === 1
            ? "Mai este disponibil doar 1 loc."
            : `Mai sunt disponibile doar ${formatSeats(ride.availableSeats)}.`
      } else if (ride && ride.status === "ACTIVE") {
        message = "Nu mai există locuri disponibile pentru această cursă."
      }
      return { status: "error", message, values }
    }
  } catch (error) {
    console.error("bookSeats failed", error)
    return {
      status: "error",
      message: "Rezervarea nu a putut fi salvată. Încearcă din nou.",
      values,
    }
  }

  revalidatePath("/", "layout")
  return {
    status: "success",
    message: `Rezervarea pentru ${formatSeats(parsed.data.seats)} a fost înregistrată și așteaptă confirmarea operatorului.`,
  }
}
