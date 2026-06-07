import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db/prisma";
import { shouldUseDatabase } from "@/lib/db/is-enabled";
import { loginSchema } from "@/lib/admin/validation";

async function issueToken(sub: string, email: string, role = "admin") {
  return jwt.sign(
    { sub, email, role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    let token: string | null = null;

    if (shouldUseDatabase()) {
      const user = await prisma.adminUser.findUnique({ where: { email } });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        token = await issueToken(user.id, user.email, user.role);
      }
    } else {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@football.com";
      const adminPass = process.env.ADMIN_PASSWORD || "admin123";
      if (email === adminEmail && password === adminPass) {
        token = await issueToken("dev-admin", email);
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
