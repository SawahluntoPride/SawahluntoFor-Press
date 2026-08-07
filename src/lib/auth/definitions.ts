import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Masukkan alamat email yang valid." }),
  password: z.string().min(1, { message: "Kata sandi harus diisi." }),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }),
    email: z.string().email({ message: "Masukkan alamat email yang valid." }),
    password: z
      .string()
      .min(8, { message: "Kata sandi minimal 8 karakter." })
      .regex(/[a-z]/i, { message: "Sertakan setidaknya satu huruf." })
      .regex(/[0-9]/, { message: "Sertakan setidaknya satu angka." }),
    confirm: z.string().min(1, { message: "Konfirmasi kata sandi harus diisi." }),
    role: z.enum(["MEDIA", "APPARATUS"]).default("MEDIA"),
    orgName: z
      .string()
      .min(2, { message: "Nama organisasi minimal 2 karakter." }),
    orgType: z
      .enum(["MEDIA_OUTLET", "GOV_DEPT"])
      .default("MEDIA_OUTLET"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Konfirmasi kata sandi tidak cocop.",
    path: ["confirm"],
  });

export const ProposalSchema = z.object({
  title: z.string().min(5, { message: "Judul minimal 5 karakter." }),
  type: z
    .enum([
      "PRESS_RELEASE",
      "PRESS_CONFERENCE",
      "MEDIA_VISIT",
      "INTERVIEW",
      "EVENT_PARTNERSHIP",
    ])
    .optional(),
  categoryId: z.string().optional(),
  scheduledAt: z.string().optional(),
  location: z
    .string()
    .max(200, { message: "Lokasi terlalu panjang." })
    .optional(),
  budget: z.coerce
    .number()
    .int({ message: "Anggaran harus berupa bilangan bulat." })
    .min(0, { message: "Anggaran tidak boleh negatif." })
    .optional(),
  description: z
    .string()
    .min(20, { message: "Deskripsi minimal 20 karakter." }),
});
