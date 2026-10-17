"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth"
import { updateBookingStatus, type BookingAction } from "@/lib/bookings"
import { formatSeats, nowLocal } from "@/lib/format"
import { createRide, deleteRide, getRide, updateRide } from "@/lib/rides"
import type { FormState } from "@/lib/types"
import { parseId, parseRideForm, type RideField } from "@/lib/validation"

function revalidateAll() {
  revalidatePath("/", "layout")
}

export async function createRideAction(
  _prev: FormState<RideField>,
  formData: FormData
): Promise<FormState<RideField>> {
  await requireAdmin()

  const parsed = parseRideForm(formData)
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifică datele introduse.",
      errors: parsed.errors,
      values: parsed.values,
    }
  }
  if (parsed.data.departureAt <= nowLocal()) {
    return {
      status: "error",
      message: "Verifică datele introduse.",
      errors: { departureAt: "Plecarea trebuie să fie în viitor." },
      values: Object.fromEntries(formData) as Record<RideField, string>,
    }
  }

  let id: number
  try {
    id = await createRide(parsed.data)
  } catch (error) {
    console.error("createRide failed", error)
    return { status: "error", message: "Cursa nu a putut fi salvată." }
  }

  revalidateAll()
  redirect(`/dash/curse/${id}`)
}

export async function updateRideAction(
  rideId: number,
  _prev: FormState<RideField>,
  formData: FormData
): Promise<FormState<RideField>> {
  await requireAdmin()

  const id = parseId(rideId)
  if (!id) return { status: "error", message: "Cursa nu există." }

  const parsed = parseRideForm(formData)
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifică datele introduse.",
      errors: parsed.errors,
      values: parsed.values,
    }
  }

  try {
    const updated = await updateRide(id, parsed.data)
    if (!updated) {
      const ride = await getRide(id)
      if (!ride) return { status: "error", message: "Cursa nu mai există." }
      const held = ride.confirmedSeats + ride.pendingSeats
      return {
        status: "error",
        message: "Verifică datele introduse.",
        errors: {
          capacity: `Capacitatea nu poate fi mai mică decât locurile deja rezervate (${formatSeats(held)}).`,
        },
        values: Object.fromEntries(formData) as Record<RideField, string>,
      }
    }
  } catch (error) {
    console.error("updateRide failed", error)
    return { status: "error", message: "Cursa nu a putut fi actualizată." }
  }

  revalidateAll()
  return { status: "success", message: "Modificările au fost salvate." }
}

export async function deleteRideAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = parseId(formData.get("id"))
  if (!id) return

  await deleteRide(id)
  revalidateAll()
  redirect("/dash")
}

const BOOKING_ACTIONS: BookingAction[] = ["confirm", "reject", "cancel"]

export async function updateBookingStatusAction(
  formData: FormData
): Promise<void> {
  await requireAdmin()

  const id = parseId(formData.get("id"))
  const action = formData.get("action") as BookingAction
  if (!id || !BOOKING_ACTIONS.includes(action)) return

  await updateBookingStatus(id, action)
  revalidateAll()
}
