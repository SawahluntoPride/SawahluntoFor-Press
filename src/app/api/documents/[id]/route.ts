import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/dal";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentikasi diperlukan." }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { proposal: { select: { authorId: true, orgId: true } } },
  });

  if (!document) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
  }

  // Hanya pemilik proposal atau admin/aparatur yang boleh akses.
  const isOwner = document.proposal.authorId === user.id;
  const isStaff = user.role === "ADMIN" || user.role === "APPARATUS";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Tidak berhak mengakses dokumen ini." }, { status: 403 });
  }

  const filename = path.basename(document.url); // ambil nama file dari url tersimpan
  const filePath = path.join(process.cwd(), "private-uploads", filename);

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan di server." }, { status: 404 });
  }
}