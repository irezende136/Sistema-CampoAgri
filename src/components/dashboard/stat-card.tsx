import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "danger" | "info";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", toneClass)}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-semibold leading-tight">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
