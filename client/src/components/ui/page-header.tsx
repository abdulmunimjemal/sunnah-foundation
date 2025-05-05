import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  subtitleClassName?: string;
  titleClassName?: string;
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "w-full bg-secondary py-12 px-4 md:py-16 md:px-6",
        className
      )}
    >
      <div className="container mx-auto max-w-6xl">
        <h1
          className={cn(
            "text-3xl font-semibold md:text-4xl lg:text-5xl",
            titleClassName
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-3 text-lg md:text-xl max-w-3xl opacity-90",
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}