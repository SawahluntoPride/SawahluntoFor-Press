import "server-only";
import { prisma } from "@/lib/prisma";
import { REQUIRED_DOCS } from "@/lib/documents";
import { uniqueSlug } from "@/lib/utils";

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getPublicOrganizations() {
  return prisma.organization.findMany({
    where: { verified: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      description: true,
      contactPerson: true,
      phone: true,
      email: true,
      website: true,
    },
  });
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: { users: { select: { id: true, name: true, role: true } } },
  });
}

export async function getRecentApprovedProposals(limit = 6) {
  return prisma.proposal.findMany({
    where: { status: "APPROVED" },
    include: {
      org: true,
      category: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getProposalById(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      org: true,
      category: true,
      author: { select: { id: true, name: true, email: true } },
      comments: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getProposalBySlug(slug: string) {
  return prisma.proposal.findUnique({
    where: { slug },
    include: {
      org: true,
      category: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function getProposalsByOrgSlug(slug: string) {
  return prisma.proposal.findMany({
    where: { org: { slug } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserProposals(userId: string, role: string) {
  const where =
    role === "ADMIN" || role === "APPARATUS" ? {} : { authorId: userId };
  return prisma.proposal.findMany({
    where,
    include: { org: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

/* ───────────────────────── Admin Dashboard ───────────────────────── */

/**
 * Fetch every uploaded document across all submissions, joined to its
 * proposal and organisation.  This powers the admin "All Documents"
 * view — a single consolidated list for batch verification.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DocumentWithProposal = Awaited<
  ReturnType<typeof prisma.document.findMany>
>[number];

export async function getAdminAllDocuments(
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<DocumentWithProposal>> {
  const skip = (page - 1) * limit;
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: {},
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            referenceNumber: true,
            org: { select: { name: true } },
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count(),
  ]);

  return {
    data: documents,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export type ProposalWithRelations = Awaited<
  ReturnType<typeof prisma.proposal.findMany>
>[number];

export async function getAdminSubmissions(
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<ProposalWithRelations>> {
  const skip = (page - 1) * limit;
  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where: {
        status: { in: ["SUBMITTED", "IN_REVIEW", "APPROVED"] },
      },
      include: {
        org: true,
        category: true,
        documents: true,
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.proposal.count({
      where: {
        status: { in: ["SUBMITTED", "IN_REVIEW", "APPROVED"] },
      },
    }),
  ]);

  return {
    data: proposals,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminSubmission(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      org: true,
      category: true,
      documents: true,
      author: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getVerifiedDocumentCount(proposalId: string): Promise<number> {
  return prisma.document.count({
    where: { proposalId, verified: true },
  });
}

export async function getAllDocumentsByProposal(proposalId: string) {
  return prisma.document.findMany({
    where: { proposalId },
    orderBy: { uploadedAt: "asc" },
  });
}

export async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = "SKP";
  const last = await prisma.proposal.findFirst({
    where: {
      referenceNumber: { startsWith: `${prefix}-${year}-` },
    },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });
  let seq = 1;
  if (last?.referenceNumber) {
    const parts = last.referenceNumber.split("-");
    const parsed = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(parsed)) seq = parsed + 1;
  }
  return `${prefix}-${year}-${String(seq).padStart(5, "0")}`;
}

export async function markDocumentVerified(documentId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({
      where: { id: documentId },
      include: { proposal: true },
    });
    if (!doc) return null;

    await tx.document.update({
      where: { id: documentId },
      data: { verified: true, verifiedAt: new Date(), verifiedBy: adminId },
    });

    const total = await tx.document.count({ where: { proposalId: doc.proposalId } });
    const verified = await tx.document.count({
      where: { proposalId: doc.proposalId, verified: true },
    });

    // Reference numbers are auto-generated at upload time by
    // checkAllDocumentsUploaded().  Here we only flip the proposal to
    // APPROVED once every document has been verified by an admin.
    if (total > 0 && verified === total && doc.proposal.status !== "APPROVED") {
      await tx.proposal.update({
        where: { id: doc.proposalId },
        data: { status: "APPROVED" },
      });
    }

    return { documentId, proposalId: doc.proposalId };
  });
}

/**
 * After a file upload, check whether every required document has been
 * uploaded for the given proposal.  If so, and no reference number exists
 * yet, auto-generate the "Nomor Pengajuan" (e.g. SKP-2026-00001).
 *
 * This is the "automatic number generation" the user sees on the
 * admin dashboard the moment all documents are uploaded.
 */
export async function checkAllDocumentsUploaded(proposalId: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { documents: true },
  });
  if (!proposal) return { uploaded: false, total: 0, uploadedCount: 0, referenceNumber: null };

  const uploadedNames = proposal.documents.map((d) => d.name);
  const missing = REQUIRED_DOCS.filter((d) => !uploadedNames.includes(d));
  const allUploaded = missing.length === 0;

  let refNumber: string | null = proposal.referenceNumber;

  if (allUploaded && !refNumber) {
    refNumber = await generateReferenceNumber();
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { referenceNumber: refNumber, status: "IN_REVIEW" },
    });
  }

  return {
    uploaded: allUploaded,
    total: REQUIRED_DOCS.length,
    uploadedCount: uploadedNames.length,
    missing,
    referenceNumber: refNumber,
  };
}

/** Get the upload + verification status of every required document for a proposal. */
export async function getDocumentStatus(proposalId: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { documents: true },
  });
  if (!proposal) return null;

  return REQUIRED_DOCS.map((docName) => {
    const doc = proposal.documents.find((d) => d.name === docName);
    return {
      name: docName,
      uploaded: !!doc,
      verified: doc?.verified ?? false,
      document: doc ?? null,
    };
  });
}

/**
 * Media companies use this flow: there is one "submission" proposal per
 * organisation that accumulates the required document uploads.  On first
 * visit a DRAFT proposal is created; on return the existing one is reused.
 */
export async function getOrCreateSubmission(userId: string, orgId: string) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.proposal.findFirst({
      where: { authorId: userId, orgId, status: "DRAFT" },
      orderBy: { createdAt: "desc" },
    });

    if (existing) return existing;

    const org = await tx.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    return tx.proposal.create({
      data: {
        title: `Pengajuan Kerja Sama — ${org?.name ?? "Media"}`,
        slug: uniqueSlug(`pengajuan-${Date.now().toString(36)}`),
        org: { connect: { id: orgId } },
        author: { connect: { id: userId } },
        description: "Pengajuan dokumen untuk kerja sama publikasi.",
        status: "DRAFT",
      },
    });
  });
}
