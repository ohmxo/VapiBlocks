import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type AnimatedGradientTextProps = ComponentPropsWithoutRef<"span"> & {
  colorFrom?: string;
  colorTo?: string;
};

export function AnimatedGradientText({
  className,
  children,
  colorFrom = "#2563EB",
  colorTo = "#F97316",
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(105deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
        backgroundSize: "220% 220%",
        animation: "gradient-shift 10s ease infinite",
      }}
      {...props}
    >
      {children}
    </span>
  );
}
