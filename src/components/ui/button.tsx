import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-dark",
  secondary: "bg-muted text-foreground hover:bg-border",
  accent: "bg-accent text-accent-foreground hover:brightness-95",
  danger: "bg-danger text-white hover:brightness-90",
  ghost: "bg-transparent text-foreground hover:bg-muted",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-13 px-6 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
