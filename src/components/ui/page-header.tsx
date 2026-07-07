import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  backHref,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  backHref?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <LinkButton href={actionHref} size="sm" className="shrink-0">
          {actionLabel}
        </LinkButton>
      )}
    </div>
  );
}
