import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "success";
};

const styles = {
  default: "bg-[--color-muted] text-[--color-foreground]",
  outline: "border border-[--color-border] text-[--color-foreground]",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
