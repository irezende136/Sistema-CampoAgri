import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          CA
        </div>
        <h1 className="text-xl font-semibold">Sistema CampoAgri</h1>
        <p className="text-sm text-muted-foreground">Gestão de visitas técnicas agronômicas</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground text-center">
        <Link href="/termos" className="hover:text-foreground">
          Termos de Uso
        </Link>{" "}
        ·{" "}
        <Link href="/privacidade" className="hover:text-foreground">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
}
