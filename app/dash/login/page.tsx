import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/dash/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { isAdmin } from "@/lib/auth"

export const metadata: Metadata = { title: "Autentificare" }

export default async function LoginPage() {
  if (await isAdmin()) redirect("/dash")

  return (
    <Card className="mx-auto mt-8 w-full max-w-sm">
      <CardHeader>
        <CardTitle>Autentificare administrator</CardTitle>
        <CardDescription>Acces restricționat.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
