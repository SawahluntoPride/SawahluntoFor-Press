/**
 * Shared authentication utilities to DRY up login logic
 */
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/auth/definitions";
import { createSession } from "@/lib/auth/session";

export interface AuthResult {
  errors?: Record<string, string[]>;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string | undefined;
  };
}

/**
 * Base authentication function that handles the common login flow
 * @param formData - Form data containing email and password
 * @param requireAdmin - If true, only allows ADMIN or APPARATUS roles
 * @returns AuthResult with user data or errors
 */
export async function authenticateUser(
  formData: FormData,
  requireAdmin: boolean = false,
): Promise<AuthResult> {
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

  // Check role requirement
  if (requireAdmin && user.role !== "ADMIN" && user.role !== "APPARATUS") {
    return {
      errors: { email: ["Akun ini tidak memiliki akses admin."] },
      message: "Akun ini tidak memiliki akses admin.",
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      organizationId: user.organizationId ?? undefined,
    },
  };
}

/**
 * Create session and return user for redirect logic
 */
export async function createUserSession(
  userId: string,
  role: string,
  orgId?: string,
): Promise<void> {
  await createSession(userId, role, orgId ?? undefined);
}
