"use client"

import { useActionState } from "react"
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import {
  RIDE_STATUS_LABELS,
  RIDE_STATUSES,
  type FormState,
  type Ride,
} from "@/lib/types"
import { MAX_CAPACITY, type RideField } from "@/lib/validation"

type RideAction = (
  prev: FormState<RideField>,
  formData: FormData
) => Promise<FormState<RideField>>

export function RideForm({
  action,
  ride,
  submitLabel,
}: {
  action: RideAction
  ride?: Ride
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const errors = state.errors ?? {}
  const defaults: Record<RideField, string> = {
    origin: ride?.origin ?? "",
    destination: ride?.destination ?? "",
    departureAt: ride?.departureAt ?? "",
    arrivalAt: ride?.arrivalAt ?? "",
    price: ride ? String(ride.price) : "",
    capacity: ride ? String(ride.capacity) : "",
    status: ride?.status ?? "active",
    ...state.values,
  }
  const heldSeats = ride ? ride.confirmedSeats + ride.pendingSeats : 0

  return (
    <form action={formAction}>
      <FieldGroup>
        {state.status === "success" && (
          <Alert>
            <CheckCircle2Icon />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        {state.status === "error" && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.origin}>
            <FieldLabel htmlFor="origin">Localitate de plecare</FieldLabel>
            <Input
              id="origin"
              name="origin"
              required
              maxLength={100}
              defaultValue={defaults.origin}
              aria-invalid={!!errors.origin}
            />
            <FieldError>{errors.origin}</FieldError>
          </Field>
          <Field data-invalid={!!errors.destination}>
            <FieldLabel htmlFor="destination">Destinație</FieldLabel>
            <Input
              id="destination"
              name="destination"
              required
              maxLength={100}
              defaultValue={defaults.destination}
              aria-invalid={!!errors.destination}
            />
            <FieldError>{errors.destination}</FieldError>
          </Field>

          <Field data-invalid={!!errors.departureAt}>
            <FieldLabel htmlFor="departureAt">Data și ora plecării</FieldLabel>
            <Input
              id="departureAt"
              name="departureAt"
              type="datetime-local"
              required
              defaultValue={defaults.departureAt}
              aria-invalid={!!errors.departureAt}
            />
            <FieldError>{errors.departureAt}</FieldError>
          </Field>
          <Field data-invalid={!!errors.arrivalAt}>
            <FieldLabel htmlFor="arrivalAt">Sosire estimată</FieldLabel>
            <Input
              id="arrivalAt"
              name="arrivalAt"
              type="datetime-local"
              required
              defaultValue={defaults.arrivalAt}
              aria-invalid={!!errors.arrivalAt}
            />
            <FieldError>{errors.arrivalAt}</FieldError>
          </Field>

          <Field data-invalid={!!errors.price}>
            <FieldLabel htmlFor="price">Preț bilet (RON)</FieldLabel>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              required
              defaultValue={defaults.price}
              aria-invalid={!!errors.price}
            />
            <FieldError>{errors.price}</FieldError>
          </Field>
          <Field data-invalid={!!errors.capacity}>
            <FieldLabel htmlFor="capacity">Capacitate totală</FieldLabel>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={Math.max(1, heldSeats)}
              max={MAX_CAPACITY}
              required
              defaultValue={defaults.capacity}
              aria-invalid={!!errors.capacity}
            />
            {ride && (
              <FieldDescription>
                Locuri deja rezervate: {heldSeats}.
              </FieldDescription>
            )}
            <FieldError>{errors.capacity}</FieldError>
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <NativeSelect
              id="status"
              name="status"
              className="w-full"
              defaultValue={defaults.status}
              aria-invalid={!!errors.status}
            >
              {RIDE_STATUSES.map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {RIDE_STATUS_LABELS[status]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{errors.status}</FieldError>
          </Field>
        </div>

        <Button type="submit" className="sm:w-fit" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
