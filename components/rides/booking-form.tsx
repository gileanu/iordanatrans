"use client"

import { useActionState } from "react"
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { FormState } from "@/lib/types"
import type { BookingField } from "@/lib/validation"

type BookingAction = (
  prev: FormState<BookingField>,
  formData: FormData
) => Promise<FormState<BookingField>>

export function BookingForm({
  action,
  maxSeats,
  unavailableReason,
}: {
  action: BookingAction
  maxSeats: number
  /** When set, bookings are closed and only this message is shown. */
  unavailableReason?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const errors = state.errors ?? {}
  const values = state.values ?? {}

  const successAlert = state.status === "success" && (
    <Alert>
      <CheckCircle2Icon />
      <AlertTitle>Rezervare trimisă</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  )

  // Kept in the same component so a success message survives the ride
  // becoming fully booked by this very booking.
  if (unavailableReason) {
    return (
      <FieldGroup>
        {successAlert}
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Rezervări indisponibile</AlertTitle>
          <AlertDescription>{unavailableReason}</AlertDescription>
        </Alert>
      </FieldGroup>
    )
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        {successAlert}
        {state.status === "error" && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Rezervarea nu a fost salvată</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.passengerName}>
          <FieldLabel htmlFor="passengerName">Nume complet</FieldLabel>
          <Input
            id="passengerName"
            name="passengerName"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={values.passengerName}
            aria-invalid={!!errors.passengerName}
          />
          <FieldError>{errors.passengerName}</FieldError>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values.email}
            aria-invalid={!!errors.email}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Telefon</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="07xx xxx xxx"
            required
            defaultValue={values.phone}
            aria-invalid={!!errors.phone}
          />
          <FieldError>{errors.phone}</FieldError>
        </Field>

        <Field data-invalid={!!errors.seats}>
          <FieldLabel htmlFor="seats">Număr de locuri</FieldLabel>
          <Input
            id="seats"
            name="seats"
            type="number"
            min={1}
            max={maxSeats}
            required
            defaultValue={values.seats ?? "1"}
            aria-invalid={!!errors.seats}
          />
          <FieldDescription>
            Maximum {maxSeats} pentru această rezervare.
          </FieldDescription>
          <FieldError>{errors.seats}</FieldError>
        </Field>

        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Rezervă
        </Button>
        <FieldDescription>
          Rezervarea rămâne în așteptare până la confirmarea ei de către
          operator.
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
