import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, children }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}