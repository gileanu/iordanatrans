import Form from "next/form"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { RideSort } from "@/lib/rides"

export const SORT_OPTIONS: { value: RideSort; label: string }[] = [
  { value: "data-asc", label: "Data plecării (cele mai apropiate)" },
  { value: "data-desc", label: "Data plecării (cele mai îndepărtate)" },
  { value: "pret-asc", label: "Preț crescător" },
  { value: "pret-desc", label: "Preț descrescător" },
]

export function RideFilters({
  origin,
  destination,
  date,
  sort,
}: {
  origin?: string
  destination?: string
  date?: string
  sort: RideSort
}) {
  return (
    <Form
      action="/cursa"
      className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto]"
    >
      <Field>
        <FieldLabel htmlFor="de_la">Plecare din</FieldLabel>
        <Input
          id="de_la"
          name="de_la"
          placeholder="ex. București"
          defaultValue={origin}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pana_la">Destinație</FieldLabel>
        <Input
          id="pana_la"
          name="pana_la"
          placeholder="ex. Brașov"
          defaultValue={destination}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="data">Data</FieldLabel>
        <Input id="data" name="data" type="date" defaultValue={date} />
      </Field>
      <Field>
        <FieldLabel htmlFor="sortare">Sortare</FieldLabel>
        <NativeSelect
          id="sortare"
          name="sortare"
          defaultValue={sort}
          className="w-full"
        >
          {SORT_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <div className="flex gap-2">
        <Button type="submit">
          <SearchIcon data-icon="inline-start" />
          Caută
        </Button>
        <Button variant="ghost" nativeButton={false} render={<Link href="/cursa" />}>
          Resetează
        </Button>
      </div>
    </Form>
  )
}
