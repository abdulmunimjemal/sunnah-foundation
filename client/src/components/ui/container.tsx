import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  size = "lg", // Default is large container
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 md:px-6 w-full",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}