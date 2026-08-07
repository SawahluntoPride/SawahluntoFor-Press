import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/dal";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Secure file serving endpoint.
 * Validates that the requested file belongs to an authorized proposal.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> },
) {
  try {
    const user = await getCurrentUser();
    const { filename } = await params;
    const requestedFile = filename.join("/");

    // Basic path traversal protection
    if (requestedFile.includes("..") || requestedFile.includes("/")) {
      return NextResponse.json(
        { error: "Invalid file path.", code: "INVALID_PATH" },
        { status: 400 },
      );
    }

    // Find the document record to verify ownership
    const document = await prisma.document.findFirst({
      where: { url: { contains: requestedFile } },
      include: { proposal: { select: { orgId: true, authorId: true } } },
    });

    if (!document) {
      return NextResponse.json(
        { error: "File not found.", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Check if user has access to this document
    if (user) {
      const hasAccess =
        user.role === "ADMIN" ||
        user.role === "APPARATUS" ||
        document.proposal.orgId === user.organizationId ||
        document.proposal.authorId === user.id;

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Unauthorized access.", code: "UNAUTHORIZED" },
          { status: 403 },
        );
      }
    } else {
      // For public access, only allow if the proposal is approved
      const proposal = await prisma.proposal.findUnique({
        where: { id: document.proposalId },
        select: { status: true },
      });

      if (proposal?.status !== "APPROVED") {
        return NextResponse.json(
          { error: "Unauthorized access.", code: "UNAUTHORIZED" },
          { status: 403 },
        );
      }
    }

    // Serve the file
    const filePath = path.join(UPLOAD_DIR, requestedFile);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.filename}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: unknown) {
    console.error("File serve error:", err);
    return NextResponse.json(
      { error: "Failed to serve file.", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
