/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/dal";
import { checkAllDocumentsUploaded } from "@/lib/db/queries";
import { isPdfBuffer } from "@/lib/file-validation";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentikasi diperlukan." },
      { status: 401 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const proposalId = formData.get("proposalId") as string | null;
    const docName = formData.get("name") as string | null;

    if (!file || !proposalId || !docName) {
      return NextResponse.json(
        { error: "File, proposalId, dan name diperlukan." },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Hanya file PDF yang diterima." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran maksimal 4 MB." },
        { status: 400 },
      );
    }

    // Ensure the proposal belongs to the current user's organisation
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { id: true, orgId: true },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal tidak ditemukan." },
        { status: 404 },
      );
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".pdf";
    const storedName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const uploadDir = path.join(process.cwd(), "private-uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isPdfBuffer(buffer)) {
    return NextResponse.json(
      { error: "Berkas bukan PDF yang valid." },
      { status: 400 },
    );
  }
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${storedName}`;

    // Create or replace document record
    const existing = await prisma.document.findFirst({
      where: { proposalId, name: docName },
    });

    let document;
    if (existing) {
      document = await prisma.document.update({
        where: { id: existing.id },
        data: {
          filename: file.name,
          url: storedName,
          size: file.size,
          uploadedAt: new Date(),
          verified: false,
          verifiedAt: null,
          verifiedBy: null,
        },
      });
    } else {
      document = await prisma.document.create({
        data: {
          proposalId,
          name: docName,
          filename: file.name,
          url: storedName, 
          size: file.size,
          uploadedAt: new Date(),
        },
      });
    }

    // ── Auto-generate reference number when ALL required documents uploaded ──
    const check = await checkAllDocumentsUploaded(proposalId);

    return NextResponse.json({
      ok: true,
      document: {
        id: document.id,
        name: document.name,
        filename: document.filename,
        url: `/api/documents/${document.id}`,
        size: document.size,
        uploadedAt: document.uploadedAt,
      },
      allUploaded: check.uploaded,
      uploadedCount: check.uploadedCount,
      totalRequired: check.total,
      referenceNumber: check.referenceNumber,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunggah berkas." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentikasi diperlukan." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const proposalId = searchParams.get("proposalId");

  if (!proposalId) {
    return NextResponse.json({ error: "proposalId diperlukan." }, { status: 400 });
  }

  const documents = await prisma.document.findMany({
    where: { proposalId },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ documents });
}
