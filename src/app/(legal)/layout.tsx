import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="max-w-[720px] mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              CA
            </div>
            <span className="font-semibold text-sm">Sistema CampoAgri</span>
          </Link>
        </div>
      </header>
      <main className="max-w-[720px] mx-auto px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
