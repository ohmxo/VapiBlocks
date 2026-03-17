"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type InteractiveGridPatternProps = React.SVGProps<SVGSVGElement> & {
  width?: number;
  height?: number;
  squares?: [number, number];
  squaresClassName?: string;
};

export function InteractiveGridPattern({
  width = 32,
  height = 32,
  squares = [36, 18],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [hoveredSquare, setHoveredSquare] = React.useState<number | null>(null);
  const [horizontal, vertical] = squares;

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn("absolute inset-0 h-full w-full", className)}
      {...props}
    >
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;

        return (
          <rect
            key={`grid-square-${index}`}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              "stroke-[#2563EB]/20 transition-colors duration-300",
              hoveredSquare === index ? "fill-[#3B82F6]/20" : "fill-transparent",
              squaresClassName
            )}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}
