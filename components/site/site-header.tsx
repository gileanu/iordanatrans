import Link from "next/link"
import { BusFrontIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/cursa", label: "Curse" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-semibold whitespace-nowrap"
        >
          <BusFrontIcon className="size-5" />
          Iordana Trans
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
