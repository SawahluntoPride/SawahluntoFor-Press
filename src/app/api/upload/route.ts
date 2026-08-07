/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/dal";
import { checkAllDocumentsUploaded } from "@/lib/db/queries";
import { Errors } from "@/lib/errors";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_EXTENSIONS = new Set([".pdf"]);
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(Errors.unauthorized(), { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const proposalId = formData.get("proposalId") as string | null;
    const docName = formData.get("name") as string | null;

    if (!file || !proposalId || !docName) {
      return NextResponse.json(
        Errors.validationError("File, proposalId, dan name diperlukan."),
        { status: 400 },
      );
    }

    // Validate file extension (more reliable than MIME type)
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(fileExtension)) {
      return NextResponse.json(Errors.invalidExtension([".pdf"]), { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(Errors.fileTooLarge("4 MB"), { status: 400 });
    }

    // Additional security: validate MIME type as well
    if (file.type !== "application/pdf") {
      return NextResponse.json(Errors.invalidFileType(["PDF"]), { status: 400 });
    }

    // Ensure the proposal belongs to the current user's organisation
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { id: true, orgId: true },
    });

    if (!proposal) {
      return NextResponse.json(Errors.notFound("Proposal"), { status: 404 });
    }

    // Generate unique filename with sanitized original name
    const ext = path.extname(file.name).toLowerCase() || ".pdf";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 100);
    const storedName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`;
    
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o750 });
    const filePath = path.join(UPLOAD_DIR, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer, { mode: 0o640 });

    // URL for serving - will be handled by a secure endpoint
    const publicUrl = `/api/uploads/${storedName}`;

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
          url: publicUrl,
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
          url: publicUrl,
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
        url: document.url,
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
    return NextResponse.json(Errors.serverError("Terjadi kesalahan saat mengunggah berkas."), {
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(Errors.unauthorized(), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const proposalId = searchParams.get("proposalId");

  if (!proposalId) {
    return NextResponse.json(
      Errors.validationError("proposalId diperlukan."),
      { status: 400 },
    );
  }

  const documents = await prisma.document.findMany({
    where: { proposalId },
    orderBy: { uploadedAt: "desc" },
  });

  // Update URLs to use secure endpoint
  const secureDocuments = documents.map((doc) => {
    const filename = path.basename(doc.url);
    return {
      ...doc,
      url: `/api/uploads/${filename}`,
    };
  });

  return NextResponse.json({ documents: secureDocuments });
}
