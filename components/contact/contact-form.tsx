"use client"

import { useActionState } from "react"
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { sendContactMessage } from "@/lib/actions/contact"

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, {})
  const errors = state.errors ?? {}
  const values = state.values ?? {}

  return (
    <form action={formAction}>
      <FieldGroup>
        {state.status === "success" && (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>Mulțumim!</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        {state.status === "error" && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Mesajul nu a fost trimis</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nume</FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              defaultValue={values.name}
              aria-invalid={!!errors.name}
            />
            <FieldError>{errors.name}</FieldError>
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
        </div>

        <Field data-invalid={!!errors.subject}>
          <FieldLabel htmlFor="subject">Subiect</FieldLabel>
          <Input
            id="subject"
            name="subject"
            required
            maxLength={150}
            defaultValue={values.subject}
            aria-invalid={!!errors.subject}
          />
          <FieldError>{errors.subject}</FieldError>
        </Field>

        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="message">Mesaj</FieldLabel>
          <Textarea
            id="message"
            name="message"
            rows={6}
            required
            maxLength={2000}
            defaultValue={values.message}
            aria-invalid={!!errors.message}
          />
          <FieldError>{errors.message}</FieldError>
        </Field>

        <Button type="submit" size="lg" className="sm:w-fit" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Trimite mesajul
        </Button>
      </FieldGroup>
    </form>
  )
}
