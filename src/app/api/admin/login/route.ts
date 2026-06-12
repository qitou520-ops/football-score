import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { shouldUseDatabase } from "@/lib/db/is-enabled";
import { loginSchema } from "@/lib/admin/validation";
import { signAdminToken } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    let token: string | null = null;

    if (shouldUseDatabase()) {
      const user = await prisma.adminUser.findUnique({ where: { email } });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        token = signAdminToken(user.id, user.email, user.role);
      }
    } else {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPass = process.env.ADMIN_PASSWORD;
      if (
        adminEmail &&
        adminPass &&
        email === adminEmail &&
        password === adminPass
      ) {
        token = signAdminToken("dev-admin", email);
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
