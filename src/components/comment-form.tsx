"use client";
import { useActionState } from "react";
import { addComment } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function CommentForm({ proposalId }: { proposalId: string }) {
  const [state, action, pending] = useActionState(addComment, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="proposalId" value={proposalId} />
      <Textarea
        name="body"
        placeholder="Tambahkan komentar..."
        required
        disabled={pending}
        rows={3}
      />
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Mengirim..." : "Kirim"}
        </Button>
      </div>
    </form>
  );
}
