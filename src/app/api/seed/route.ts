import "server-only";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import "@/lib/config/validation";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const categories = [
    "Rilis Pers",
    "Konferensi Pers",
    "Kunjungan Pers",
    "Wawancara",
    "Kemitraan Acara",
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(c) },
      update: {},
      create: { name: c, slug: slugify(c) },
    });
  }

  const catMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  const dept = await prisma.organization.upsert({
    where: { slug: "dikominfo-sawahlunto" },
    update: { verified: true },
    create: {
      name: "Dinas Komunikasi dan Informatika Kota Sawahlunto",
      slug: "dikominfo-sawahlunto",
      type: "GOV_DEPT",
      verified: true,
      contactPerson: "Tim Humas",
      phone: "0751 23456",
      email: "humas@sawahlunto.go.id",
      address: "Jl. Diponegoro No.1, Sawahlunto",
      website: "https://sawahlunto.go.id",
      description:
        "Dinas Komunikasi dan Informatika Kota Sawahlunto menjalin kerja sama dengan media pers dalam rangka transparansi dan pelayanan publik.",
    },
  });

  const outlet1 = await prisma.organization.upsert({
    where: { slug: "kompas-sawahlunto" },
    update: {},
    create: {
      name: "Kompas (Kantor Representasi Sumatera Barat)",
      slug: "kompas-sawahlunto",
      type: "MEDIA_OUTLET",
      verified: true,
      contactPerson: "Redaksi Kompas",
      phone: "0812-3456-7890",
      email: "redaksi@sawahlunto.kompas.com",
      website: "https://www.kompas.com",
      description: "Media nasional dengan jaringan cabang di Sawahlunto.",
    },
  });

  await prisma.organization.upsert({
    where: { slug: "radar-sawahlunto" },
    update: {},
    create: {
      name: "Radar Sawahlunto",
      slug: "radar-sawahlunto",
      type: "MEDIA_OUTLET",
      verified: true,
      contactPerson: "Pelita Rakyat",
      phone: "0813-4567-8901",
      email: "radar.sawahlunto@radar.co.id",
      website: "https://www.radarweb.itc.co.id",
      description: "Harian lokal yang melayani masyarakat Sawahlunto.",
    },
  });

  const adminPass = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@sawahlunto.go.id" },
    update: { password: adminPass },
    create: {
      email: "admin@sawahlunto.go.id",
      name: "Administrator Sistem",
      password: adminPass,
      role: "ADMIN",
      organizationId: dept.id,
    },
  });

  const apparatusPass = await bcrypt.hash("Aparatur123!", 10);
  await prisma.user.upsert({
    where: { email: "humas@sawahlunto.go.id" },
    update: { password: apparatusPass },
    create: {
      email: "humas@sawahlunto.go.id",
      name: "Tim Humas Pemkot",
      password: apparatusPass,
      role: "APPARATUS",
      organizationId: dept.id,
    },
  });

  const mediaPass = await bcrypt.hash("Media123!", 10);
  const mediaUser = await prisma.user.upsert({
    where: { email: "wartawan@kompas.com" },
    update: { password: mediaPass },
    create: {
      email: "wartawan@kompas.com",
      name: "Wartawan Kompas",
      password: mediaPass,
      role: "MEDIA",
      organizationId: outlet1.id,
    },
  });

  const proposal = await prisma.proposal.upsert({
    where: { slug: "kerjasama-pers-rilis-keuangan-desa" },
    update: { status: "APPROVED" },
    create: {
      title: "Rilis Pers: Keterbukaan Laporan Keuangan Desa",
      slug: "kerjasama-pers-rilis-keuangan-desa",
      orgId: outlet1.id,
      authorId: mediaUser.id,
      categoryId: catMap[slugify("Rilis Pers")] ?? null,
      type: "PRESS_RELEASE",
      scheduledAt: new Date("2026-09-15T10:00:00+00:00"),
      location: "Ruang Rapat Wali Kota, Sawahlunto",
      budget: 0,
      description:
        "Kompas akan menerbitkan rilis pers terkait pelaporan keuangan desa agar warga dapat memantau penghasilan dan pengeluaran pemerdes secara transparan.",
      status: "APPROVED",
      statusNote: "Disetujui oleh Tim Humas.",
    },
  });

  return NextResponse.json({
    ok: true,
    seeded: { categories: categories.length, organizations: 3, users: 3, proposal: !!proposal },
  });
}
