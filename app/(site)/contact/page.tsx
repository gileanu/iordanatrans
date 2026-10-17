import type { Metadata } from "next"

import { ContactForm } from "@/components/contact/contact-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact",
  description: "Trimite-ne un mesaj pentru orice întrebare despre curse.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Contact
        </h1>
        <p className="text-sm text-muted-foreground">
          Ai o întrebare despre o cursă sau o rezervare? Scrie-ne.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trimite un mesaj</CardTitle>
          <CardDescription>Toate câmpurile sunt obligatorii.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  )
}
