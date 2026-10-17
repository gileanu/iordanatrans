import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLinkIcon, LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"
import { isAdmin } from "@/lib/auth"

export const metadata: Metadata = {
  title: {
    default: "Panou de administrare",
    template: "%s · Admin Iordana Trans",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/dash" className="font-heading font-semibold">
            Iordana Trans · Admin
          </Link>
          {admin && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/" />}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                <span className="hidden sm:inline">Vezi site-ul</span>
              </Button>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOutIcon data-icon="inline-start" />
                  Ieșire
                </Button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        {children}
      </main>
    </div>
  )
}
