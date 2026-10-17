import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { RideList } from "@/components/rides/ride-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { listUpcomingRides } from "@/lib/rides"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const rides = await listUpcomingRides({ limit: 6 })

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-4 py-16 md:py-24">
          <Badge variant="secondary">Transport de persoane</Badge>
          <h1 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            Titlu placeholder pentru secțiunea principală
          </h1>
          <p className="max-w-xl text-muted-foreground md:text-lg">
            Text placeholder care descrie pe scurt serviciile de transport și
            avantajele rezervării online. Va fi înlocuit cu conținutul final.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/cursa" />}
            >
              Vezi toate cursele
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Contact
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Curse disponibile
            </h2>
            <p className="text-sm text-muted-foreground">
              Următoarele plecări programate.
            </p>
          </div>
          <Button
            variant="link"
            nativeButton={false}
            render={<Link href="/cursa" />}
          >
            Toate cursele
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
        <RideList rides={rides} />
      </section>
    </>
  )
}
