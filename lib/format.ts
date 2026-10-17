import { differenceInMinutes, format, parseISO } from "date-fns"
import { ro } from "date-fns/locale"

export const TIME_ZONE = "Europe/Bucharest"

const wallClockFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

/** Current Romanian local time as "YYYY-MM-DDTHH:mm", comparable to ride dates. */
export function nowLocal(): string {
  return wallClockFormatter.format(new Date()).replace(" ", "T")
}

/** Formats a ride wall-clock date ("YYYY-MM-DDTHH:mm"). */
export function formatDateTime(value: string): string {
  return format(parseISO(value), "EEE, d MMM yyyy, HH:mm", { locale: ro })
}

export function formatDate(value: string): string {
  return format(parseISO(value), "EEEE, d MMMM yyyy", { locale: ro })
}

export function formatTime(value: string): string {
  return format(parseISO(value), "HH:mm")
}

export function formatDuration(from: string, to: string): string {
  const minutes = differenceInMinutes(parseISO(to), parseISO(from))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

const timestampFormatter = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
})

/** Formats a UTC ISO timestamp in Romanian local time. */
export function formatTimestamp(value: string): string {
  return timestampFormatter.format(new Date(value))
}

const priceFormatter = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
})

export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

/** Romanian count phrase: "1 loc", "5 locuri", "20 de locuri". */
export function formatCount(
  count: number,
  singular: string,
  plural: string
): string {
  if (count === 1) return `1 ${singular}`
  const rest = count % 100
  const needsDe = count !== 0 && (rest === 0 || rest >= 20)
  return needsDe ? `${count} de ${plural}` : `${count} ${plural}`
}

export function formatSeats(count: number): string {
  return formatCount(count, "loc", "locuri")
}
