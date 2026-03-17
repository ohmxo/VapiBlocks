import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ShimmerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

const sizeClasses: Record<NonNullable<ShimmerButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "h-14 w-14 rounded-full",
};

const variantClasses: Record<NonNullable<ShimmerButtonProps["variant"]>, string> = {
  default:
    "border border-white/15 bg-white/5 text-white shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:bg-white/10",
  ghost:
    "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
};

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      asChild = false,
      variant = "default",
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const sharedClasses = cn(
      "group relative inline-flex items-center justify-center overflow-hidden rounded-full transition-all duration-500 ease-out hover:scale-[1.03] active:scale-95",
      sizeClasses[size],
      variantClasses[variant],
      className
    );

    if (asChild) {
      return (
        <Comp ref={ref} className={sharedClasses} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={sharedClasses}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <span className="pointer-events-none absolute inset-0 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-20deg] bg-white/20 opacity-0 blur-md transition-opacity duration-700 group-hover:opacity-60 group-hover:animate-shine" />
      </Comp>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
export type { ShimmerButtonProps };
