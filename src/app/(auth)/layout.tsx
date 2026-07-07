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
    </div>
  );
}
