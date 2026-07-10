import Image from "next/image";

export function OrgMark({ logoUrl, size = 36 }: { logoUrl: string | null; size?: number }) {
  if (logoUrl) {
    return (
      <div
        className="rounded-lg overflow-hidden shrink-0 bg-card border border-border flex items-center justify-center"
        style={{ height: size, width: size }}
      >
        <Image src={logoUrl} alt="Logo" width={size} height={size} className="object-contain w-full h-full" unoptimized />
      </div>
    );
  }

  return (
    <div
      className="rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0"
      style={{ height: size, width: size, fontSize: size * 0.4 }}
    >
      CA
    </div>
  );
}
