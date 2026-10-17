"use client"

import { useActionState } from "react"
import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { login } from "@/lib/actions/auth"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {})

  return (
    <form action={formAction}>
      <FieldGroup>
        {state.status === "error" && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={state.values?.email}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Parolă</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Autentificare
        </Button>
      </FieldGroup>
    </form>
  )
}
