"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  LoginSchema,
  RegisterSchema,
  ProposalSchema,
} from "@/lib/auth/definitions";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/dal";
import { uniqueSlug } from "@/lib/utils";
import { markDocumentVerified, getOrCreateSubmission } from "@/lib/db/queries";

export async function login(prevState: unknown, formData: FormData) {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Email atau kata sandi salah.",
    };
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user?.password) {
    return {
      errors: { email: ["Email atau kata sandi salah."] },
      message: "Email atau kata sandi salah.",
    };
  }
  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) {
    return {
      errors: { password: ["Kata sandi salah."] },
      message: "Email atau kata sandi salah.",
    };
  }
  await createSession(user.id, user.role, user.organizationId ?? undefined);

  // Redirect based on role — admins and apparatus go to the admin panel,
  // media users go to their dashboard.
  if (user.role === "ADMIN" || user.role === "APPARATUS") {
    redirect("/admin");
  }
  redirect("/dashboard");
}

/**
 * Admin-only login action. Authenticates the user and always redirects
 * to the admin panel. If the authenticated user is not an admin or
 * apparatus, they are redirected to the public dashboard instead.
 */
export async function adminLogin(prevState: unknown, formData: FormData) {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Email atau kata sandi salah.",
    };
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user?.password) {
    return {
      errors: { email: ["Email atau kata sandi salah."] },
      message: "Email atau kata sandi salah.",
    };
  }
  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) {
    return {
      errors: { password: ["Kata sandi salah."] },
      message: "Email atau kata sandi salah.",
    };
  }

  if (user.role !== "ADMIN" && user.role !== "APPARATUS") {
    return {
      errors: { email: ["Akun ini tidak memiliki akses admin."] },
      message: "Akun ini tidak memiliki akses admin.",
    };
  }

  await createSession(user.id, user.role, user.organizationId ?? undefined);
  redirect("/admin");
}

export async function register(prevState: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { errors: { email: ["Email sudah terdaftar. Pilih email lain."] } };
  }
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const orgType =
    parsed.data.role === "APPARATUS" ? "GOV_DEPT" : "MEDIA_OUTLET";
  const org = await prisma.organization.create({
    data: {
      name: parsed.data.orgName,
      slug: uniqueSlug(parsed.data.orgName),
      type: orgType,
      verified: parsed.data.role === "APPARATUS",
    },
  });
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: hash,
      role: parsed.data.role,
      organization: { connect: { id: org.id } },
    },
  });
  redirect("/masuk");
}

export async function logout() {
  await deleteSession();
  redirect("/masuk");
}

export async function submitProposal(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");

  const parsed = ProposalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const proposal = await prisma.proposal.create({
    data: {
      title: parsed.data.title,
      slug: uniqueSlug(parsed.data.title),
      org: user.organization ? { connect: { id: user.organization.id } } : undefined,
      author: { connect: { id: user.id } },
      category: parsed.data.categoryId
        ? { connect: { id: parsed.data.categoryId } }
        : undefined,
      type: parsed.data.type ?? null,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : undefined,
      location: parsed.data.location ?? null,
      budget: parsed.data.budget ?? null,
      description: parsed.data.description,
      status: "DRAFT",
    },
  });
  revalidatePath("/dashboard");
  redirect(`/proposals/${proposal.id}`);
}

export async function updateProposal(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const id = String(formData.get("id") ?? "");
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) return { error: "Proposal tidak ditemukan." };
  if (proposal.authorId !== user.id) redirect(`/proposals/${id}`);
  if (proposal.status !== "DRAFT") {
    return { error: "Proposal yang sudah diserahkan tidak dapat diubah." };
  }
  const parsed = ProposalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  await prisma.proposal.update({
    where: { id },
    data: {
      title: parsed.data.title,
      category: parsed.data.categoryId
        ? { connect: { id: parsed.data.categoryId } }
        : { disconnect: true },
      type: parsed.data.type ?? null,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : null,
      location: parsed.data.location ?? null,
      budget: parsed.data.budget ?? null,
      description: parsed.data.description,
    },
  });
  revalidatePath(`/proposals/${id}`);
  revalidatePath("/dashboard");
  redirect(`/proposals/${id}`);
}

export async function submitProposalToReview(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const id = String(formData.get("id") ?? "");
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) return { error: "Proposal tidak ditemukan." };
  if (proposal.authorId !== user.id) redirect(`/proposals/${id}`);
  if (proposal.status !== "DRAFT") {
    return { error: "Status proposal tidak memungkinkan." };
  }
  await prisma.proposal.update({
    where: { id },
    data: { status: "SUBMITTED" },
  });
  revalidatePath(`/proposals/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateProposalStatus(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "ADMIN" && user.role !== "APPARATUS") {
    return { error: "Tidak berhak." };
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const ALLOWED = [
    "IN_REVIEW",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
    "CANCELLED",
  ] as const;
  if (!ALLOWED.includes(status as (typeof ALLOWED)[number])) {
    return { error: "Status tidak valid." };
  }
  await prisma.proposal.update({
    where: { id },
    data: { status: status as (typeof ALLOWED)[number], statusNote: note },
  });
  revalidatePath(`/proposals/${id}`);
  return { ok: true };
}

export async function deleteProposal(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const id = String(formData.get("id") ?? "");
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) redirect(`/proposals/${id}`);
  if (proposal.authorId !== user.id || proposal.status !== "DRAFT") {
    redirect(`/proposals/${proposal.id}`);
  }
  await prisma.proposal.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/proposals");
  redirect("/proposals");
}

export async function addComment(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const proposalId = String(formData.get("proposalId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!proposalId || !body) {
    return { error: "Komentar tidak boleh kosong." };
  }
  await prisma.comment.create({
    data: { proposalId, userId: user.id, body },
  });
  revalidatePath(`/proposals/${proposalId}`);
  return { ok: true };
}

/* ─────────────────────── Admin document verification ─────────────────────── */

export async function verifyDocument(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "ADMIN" && user.role !== "APPARATUS") {
    return { error: "Tidak berhak." };
  }
  const documentId = String(formData.get("documentId") ?? "");
  if (!documentId) return { error: "Dokumen tidak ditemukan." };

  const result = await markDocumentVerified(documentId, user.id);
  if (!result) return { error: "Dokumen tidak ditemukan." };

  revalidatePath(`/admin/proposals/${result.proposalId}`);
  revalidatePath(`/admin`);

  return {
    ok: true,
    documentId,
    proposalId: result.proposalId,
  };
}

export async function getOrCreateSubmissionAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (!user.organizationId) redirect("/daftar");
  const proposal = await getOrCreateSubmission(user.id, user.organizationId);
  return proposal;
}
