"use client";
import { cn } from "@/lib/utils";

type Status = "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
const labels: Record<Status, string> = { DRAFT: "Draft", SUBMITTED: "Diserahkan", IN_REVIEW: "Dalam Review", APPROVED: "Disetujui", REJECTED: "Ditolak", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };
const styles: Record<Status, string> = {
  DRAFT: "border border-border text-muted-foreground",
  SUBMITTED: "border border-border text-foreground bg-muted",
  IN_REVIEW: "border border-border text-foreground bg-muted",
  APPROVED: "border border-foreground/20 text-foreground bg-foreground/5",
  REJECTED: "border border-destructive/30 text-destructive",
  COMPLETED: "border border-foreground/20 text-foreground bg-foreground/5",
  CANCELLED: "border border-border text-muted-foreground",
};
export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("inline-flex items-center rounded-[2px] px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", styles[status])}>{labels[status]}</span>;
}
