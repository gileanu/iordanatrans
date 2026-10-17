import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { RideForm } from "@/components/dash/ride-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createRideAction } from "@/lib/actions/admin"
import { requireAdmin } from "@/lib/auth"

export const metadata: Metadata = { title: "Cursă nouă" }

export default async function NewRidePage() {
  await requireAdmin()

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/dash" />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Înapoi la panou
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Adaugă o cursă nouă</CardTitle>
        </CardHeader>
        <CardContent>
          <RideForm action={createRideAction} submitLabel="Salvează cursa" />
        </CardContent>
      </Card>
    </>
  )
}
