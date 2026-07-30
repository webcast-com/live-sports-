import * as React from "react";
import { cn } from "./utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "premium" | "success";

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-white",
  outline: "text-foreground border border-border",
  premium: "border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white",
  success: "border-transparent border",
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {},
  secondary: {},
  destructive: {},
  outline: {},
  premium: {},
  success: { backgroundColor: 'rgba(64, 131, 40, 1)', color: 'rgba(255, 255, 255, 1)' },
};

export function Badge({ className, variant = "default", style, ...props }: BadgeProps & { style?: React.CSSProperties }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}
