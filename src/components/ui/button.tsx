import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[--color-accent] text-[--color-accent-foreground] hover:bg-[--color-accent]/90",
  secondary:
    "bg-[--color-muted] text-[--color-foreground] hover:bg-[--color-muted]/80",
  ghost:
    "bg-transparent text-[--color-foreground] hover:bg-[--color-muted]/60",
  outline:
    "border border-[--color-border] text-[--color-foreground] hover:bg-[--color-muted]/70",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, children, variant = "primary", size = "md", asChild = false, ...props },
    ref,
  ) => (
    <SlotOrButton
      ref={ref}
      asChild={asChild}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={props.disabled}
      {...props}
    >
      {children}
    </SlotOrButton>
  ),
);
Button.displayName = "Button";

type SlotOrButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
};

const SlotOrButton = React.forwardRef<HTMLButtonElement, SlotOrButtonProps>(
  ({ asChild, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedType = type ?? "button";
    return (
      <Comp
        ref={ref as never}
        type={!asChild ? resolvedType : undefined}
        {...props}
      />
    );
  },
);
SlotOrButton.displayName = "SlotOrButton";
