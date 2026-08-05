"use client";
import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn("appearance-none w-full rounded-[2px] border border-border bg-transparent px-4 pr-10 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}</select>
    <span className="material-symbols-rounded pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">expand_more</span>
  </div>
));
Select.displayName = "Select";

export function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props}>{children}</label>;
}
