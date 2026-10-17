export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Iordana Trans. Toate drepturile rezervate.
      </div>
    </footer>
  )
}
