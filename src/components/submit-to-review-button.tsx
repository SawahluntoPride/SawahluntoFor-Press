"use client";
import { useActionState } from "react";
import { submitProposalToReview } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function SubmitToReviewButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(submitProposalToReview, undefined);
  return (
    <>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Serahkan..." : "Serahkan untuk Review"}
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 text-xs text-destructive">{state.error}</p>
      )}
    </>
  );
}
