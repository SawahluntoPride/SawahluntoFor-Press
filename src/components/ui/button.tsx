"use client";
import React, { cloneElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; asChild?: boolean; }

export function Button({ className, variant = "primary", size = "md", asChild = false, ...props }: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-[2px] text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-accent",
    variant === "secondary" && "border border-foreground/20 bg-transparent text-foreground hover:bg-foreground hover:text-background",
    variant === "outline" && "border border-border bg-transparent text-foreground hover:bg-muted",
    variant === "ghost" && "hover:bg-muted text-foreground",
    variant === "destructive" && "bg-destructive text-destructive-foreground hover:opacity-85",
    size === "sm" && "h-8 px-3.5 text-xs",
    size === "md" && "h-10 px-5",
    size === "lg" && "h-12 px-7 text-base",
    className,
  );
  if (asChild) {
    const child = React.Children.only(props.children) as ReactElement<{ className?: string }>;
    delete (props as Record<string, unknown>).children;
    return cloneElement(child, { className: cn(cls, child.props.className), ...props });
  }
  return <button className={cls} {...props} />;
}
