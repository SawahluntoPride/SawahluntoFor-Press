"use client";
import { useActionState } from "react";
import { updateProposalStatus } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";

const OPTIONS = [
  { value: "IN_REVIEW", label: "Dalam Review" },
  { value: "APPROVED", label: "Setujui" },
  { value: "REJECTED", label: "Tolak" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Batal" },
];

export function StatusChangeForm({ proposalId }: { proposalId: string }) {
  const [state, action, pending] = useActionState(updateProposalStatus, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={proposalId} />
      <Select name="status" defaultValue="APPROVED" disabled={pending}>
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <Textarea name="note" placeholder="Catatan (opsional)" rows={2} disabled={pending} />
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Menyimpan..." : "Perbarui Status"}
        </Button>
      </div>
    </form>
  );
}
