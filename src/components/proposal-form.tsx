"use client";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { type Category } from "@/lib/generated/prisma";

const TYPE_LABELS: Record<string, string> = {
  PRESS_RELEASE: "Rilis Pers",
  PRESS_CONFERENCE: "Konferensi Pers",
  MEDIA_VISIT: "Kunjungan Pers",
  INTERVIEW: "Wawancara",
  EVENT_PARTNERSHIP: "Kemitraan Acara",
};

export interface ProposalData {
  id?: string;
  title?: string;
  type?: string | null;
  categoryId?: string | null;
  scheduledAt?: string | null;
  location?: string | null;
  budget?: number | null;
  description?: string | null;
}

interface Props {
  categories: Category[];
  initialData?: ProposalData | null;
  action: (
    prevState: unknown,
    data: FormData,
  ) => { errors?: Record<string, string[]>; message?: string; error?: string } | null | Promise<{ errors?: Record<string, string[]>; message?: string; error?: string } | null>;
  submitLabel?: string;
}

export function ProposalForm({ categories, initialData, action, submitLabel = "Simpan" }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const dateValue = initialData?.scheduledAt
    ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={initialData?.id ?? ""} />

      <FormField label="Judul Proposal" name="title" error={state?.errors?.title}>
        <Input
          name="title"
          defaultValue={initialData?.title ?? ""}
          placeholder="Misal: Rilis Pers Anggaran Kota"
          required
          disabled={pending}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Jenis" name="type" error={state?.errors?.type}>
          <Select name="type" defaultValue={initialData?.type ?? ""} disabled={pending}>
            <option value="">Pilih jenis</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Kategori" name="categoryId" error={state?.errors?.categoryId}>
          <Select name="categoryId" defaultValue={initialData?.categoryId ?? ""} disabled={pending}>
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Tanggal & Waktu" name="scheduledAt" error={state?.errors?.scheduledAt}>
          <Input
            type="datetime-local"
            name="scheduledAt"
            defaultValue={dateValue}
            disabled={pending}
          />
        </FormField>
        <FormField label="Lokasi" name="location" error={state?.errors?.location}>
          <Input
            name="location"
            defaultValue={initialData?.location ?? ""}
            placeholder="Tempat kegiatan"
            disabled={pending}
          />
        </FormField>
      </div>

      <FormField label="Anggaran (Rp)" name="budget" error={state?.errors?.budget}>
        <Input
          type="number"
          name="budget"
          defaultValue={initialData?.budget ?? ""}
          placeholder="0"
          min={0}
          disabled={pending}
        />
      </FormField>

      <FormField
        label="Deskripsi Proposal"
        name="description"
        error={state?.errors?.description}
        description="Jelaskan tujuan, agenda, dan manfaat kerjasama ini."
      >
        <Textarea
          name="description"
          defaultValue={initialData?.description ?? ""}
          placeholder="Deskripsi rincian..."
          required
          disabled={pending}
        />
      </FormField>

      {(state?.message || state?.error) && (
        <p className="text-sm text-destructive">{state.message ?? state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? `${submitLabel}...` : submitLabel}
      </Button>
    </form>
  );
}
