"use client";

export function AutoSubmitForm({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <form
      className={className}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
    >
      {children}
      <noscript>
        <button type="submit">Filtrar</button>
      </noscript>
    </form>
  );
}
