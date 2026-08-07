"use client";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ type, style, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    style={{
      width: "100%",
      height: 48,
      padding: "13px 14px",
      borderRadius: 2,
      border: "1px solid var(--color-line)",
      backgroundColor: "var(--color-bg)",
      fontSize: 15,
      fontFamily: "var(--font-body), 'Roboto Flex', sans-serif",
      fontWeight: 400,
      lineHeight: 1.2,
      color: "var(--color-ink)",
      outline: "none",
      transition: "border-color 0.2s",
      ...style,
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "var(--color-accent)";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "var(--color-line)";
      props.onBlur?.(e);
    }}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ style, ...props }, ref) => (
  <textarea
    ref={ref}
    style={{
      width: "100%",
      minHeight: 120,
      padding: "13px 14px",
      borderRadius: 2,
      border: "1px solid var(--color-line)",
      backgroundColor: "var(--color-bg)",
      fontSize: 15,
      fontFamily: "var(--font-body), 'Roboto Flex', sans-serif",
      fontWeight: 400,
      lineHeight: 1.2,
      color: "var(--color-ink)",
      outline: "none",
      resize: "vertical" as const,
      transition: "border-color 0.2s",
      ...style,
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "var(--color-accent)";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "var(--color-line)";
      props.onBlur?.(e);
    }}
    {...props}
  />
));
Textarea.displayName = "Textarea";
