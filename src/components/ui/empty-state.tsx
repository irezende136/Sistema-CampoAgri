import { LinkButton } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4 border border-dashed border-border rounded-2xl">
      <h3 className="font-semibold text-base">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {actionLabel && actionHref && (
        <LinkButton href={actionHref} className="mt-5">
          {actionLabel}
        </LinkButton>
      )}
    </div>
  );
}
