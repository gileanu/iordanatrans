import {
  RIDE_STATUSES,
  type BookingInput,
  type RideInput,
  type RideStatus,
} from "@/lib/types"

type Result<T, Field extends string> =
  | { success: true; data: T }
  | {
      success: false
      errors: Partial<Record<Field, string>>
      values: Partial<Record<Field, string>>
    }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9][0-9 ().-]{5,18}[0-9]$/
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PRICE_RE = /^\d+([.,]\d{1,2})?$/

function readFields<Field extends string>(
  formData: FormData,
  fields: readonly Field[]
): Record<Field, string> {
  const values = {} as Record<Field, string>
  for (const field of fields) {
    const value = formData.get(field)
    values[field] = typeof value === "string" ? value.trim() : ""
  }
  return values
}

function validText(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}

function isValidDateTime(value: string): boolean {
  if (!DATETIME_RE.test(value)) return false
  const date = new Date(`${value}:00Z`)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 16) === value
  )
}

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export function parseId(value: unknown): number | null {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

const RIDE_FIELDS = [
  "origin",
  "destination",
  "departureAt",
  "arrivalAt",
  "price",
  "capacity",
  "status",
] as const
export type RideField = (typeof RIDE_FIELDS)[number]

export const MAX_CAPACITY = 100

export function parseRideForm(
  formData: FormData
): Result<RideInput, RideField> {
  const values = readFields(formData, RIDE_FIELDS)
  const errors: Partial<Record<RideField, string>> = {}

  if (!validText(values.origin, 2, 100)) {
    errors.origin = "Introdu localitatea de plecare (2–100 caractere)."
  }
  if (!validText(values.destination, 2, 100)) {
    errors.destination = "Introdu destinația (2–100 caractere)."
  } else if (
    values.origin.toLocaleLowerCase("ro") ===
    values.destination.toLocaleLowerCase("ro")
  ) {
    errors.destination = "Destinația trebuie să fie diferită de plecare."
  }

  if (!isValidDateTime(values.departureAt)) {
    errors.departureAt = "Alege o dată și o oră de plecare valide."
  }
  if (!isValidDateTime(values.arrivalAt)) {
    errors.arrivalAt = "Alege o dată și o oră de sosire valide."
  } else if (
    !errors.departureAt &&
    values.arrivalAt <= values.departureAt
  ) {
    errors.arrivalAt = "Sosirea trebuie să fie după plecare."
  }

  const price = Number(values.price.replace(",", "."))
  if (!PRICE_RE.test(values.price) || price > 100_000) {
    errors.price = "Introdu un preț valid (maximum două zecimale)."
  }

  const capacity = Number(values.capacity)
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_CAPACITY) {
    errors.capacity = `Capacitatea trebuie să fie între 1 și ${MAX_CAPACITY} de locuri.`
  }

  if (!RIDE_STATUSES.includes(values.status as RideStatus)) {
    errors.status = "Alege un status valid."
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  return {
    success: true,
    data: {
      origin: values.origin,
      destination: values.destination,
      departureAt: values.departureAt,
      arrivalAt: values.arrivalAt,
      price,
      capacity,
      status: values.status as RideStatus,
    },
  }
}

const BOOKING_FIELDS = ["passengerName", "email", "phone", "seats"] as const
export type BookingField = (typeof BOOKING_FIELDS)[number]

export const MAX_SEATS_PER_BOOKING = 10

export function parseBookingForm(
  formData: FormData
): Result<BookingInput, BookingField> {
  const values = readFields(formData, BOOKING_FIELDS)
  const errors: Partial<Record<BookingField, string>> = {}

  if (!validText(values.passengerName, 2, 100)) {
    errors.passengerName = "Introdu numele complet (2–100 caractere)."
  }
  if (values.email.length > 254 || !EMAIL_RE.test(values.email)) {
    errors.email = "Introdu o adresă de email validă."
  }
  if (!PHONE_RE.test(values.phone)) {
    errors.phone = "Introdu un număr de telefon valid."
  }
  const seats = Number(values.seats)
  if (
    !Number.isInteger(seats) ||
    seats < 1 ||
    seats > MAX_SEATS_PER_BOOKING
  ) {
    errors.seats = `Poți rezerva între 1 și ${MAX_SEATS_PER_BOOKING} locuri.`
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  return {
    success: true,
    data: {
      passengerName: values.passengerName,
      email: values.email.toLowerCase(),
      phone: values.phone,
      seats,
    },
  }
}

const CONTACT_FIELDS = ["name", "email", "subject", "message"] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactInput = Record<ContactField, string>

export function parseContactForm(
  formData: FormData
): Result<ContactInput, ContactField> {
  const values = readFields(formData, CONTACT_FIELDS)
  const errors: Partial<Record<ContactField, string>> = {}

  if (!validText(values.name, 2, 100)) {
    errors.name = "Introdu numele (2–100 caractere)."
  }
  if (values.email.length > 254 || !EMAIL_RE.test(values.email)) {
    errors.email = "Introdu o adresă de email validă."
  }
  if (!validText(values.subject, 3, 150)) {
    errors.subject = "Introdu subiectul (3–150 caractere)."
  }
  if (!validText(values.message, 10, 2000)) {
    errors.message = "Mesajul trebuie să aibă între 10 și 2000 de caractere."
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  return { success: true, data: values }
}
