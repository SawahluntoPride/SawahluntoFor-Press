import "server-only";
import { prisma } from "@/lib/prisma";

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
