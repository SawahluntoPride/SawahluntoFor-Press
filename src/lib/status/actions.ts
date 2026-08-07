"use server";
import { getProposalStatusByReference } from "@/lib/db/queries";

export async function checkStatus(prevState: unknown, formData: FormData) {
  const reference = String(formData.get("reference") ?? "").trim();
  if (!reference) {
    return { error: "Nomor Pengajuan harus diisi." };
  }

  const result = await getProposalStatusByReference(reference);
  if (!result) {
    return { error: "Nomor Pengajuan tidak ditemukan. Periksa kembali penulisannya." };
  }

  return { ok: true, data: result };
}