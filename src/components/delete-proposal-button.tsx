"use client";
import { deleteProposal } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function DeleteProposalButton({ id }: { id: string }) {
  return (
    <form action={deleteProposal}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        className="w-full"
        onClick={(e) => {
          if (!confirm("Hapus proposal ini secara permanen?")) e.preventDefault();
        }}
      >
        Hapus
      </Button>
    </form>
  );
}
