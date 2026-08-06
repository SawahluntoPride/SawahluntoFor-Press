"use client";

import { useActionState } from "react";
import { verifyDocument } from "@/lib/auth/actions";

export function VerifyDocumentButton({ documentId, verified }: { documentId: string; verified: boolean }) {
  const [state, action, pending] = useActionState(verifyDocument, undefined);

  // After a successful verification, revalidatePath reloads the server
  // component and the `verified` prop flips to true — the component
  // re-mounts with verified=true, so useActionState state resets to undefined.

  if (state?.error) {
    return (
      <>
        <p className="admin-doc-error">{state.error}</p>
        <button
          formAction={action}
          type="submit"
          name="documentId"
          value={documentId}
          className="admin-doc-verify-btn"
          disabled={pending}
        >
          <span className="material-symbols-rounded admin-verify-btn-icon">
            check_circle
          </span>
          Coba lagi
        </button>
      </>
    );
  }

  if (verified) {
    return (
      <div className="admin-doc-verified">
        <span className="material-symbols-rounded admin-verify-btn-icon">
          verified
        </span>
        Terverifikasi
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="documentId" value={documentId} />
      <button
        type="submit"
        className="admin-doc-verify-btn"
        disabled={pending}
      >
        <span className="material-symbols-rounded admin-verify-btn-icon">
          check_circle
        </span>
        {pending ? "Memverifikasi..." : "Verifikasi"}
      </button>
    </form>
  );
}
