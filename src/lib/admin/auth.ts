import "server-only";

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return secret || "dev-secret";
}

export interface AdminSession {
  sub: string;
  email: string;
  role?: string;
}

export function verifyAdminToken(token?: string | null): AdminSession | null {
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret()) as AdminSession;
  } catch {
    return null;
  }
}

export function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  return verifyAdminToken(token);
}

export function requireAdmin(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function signAdminToken(sub: string, email: string, role = "admin"): string {
  return jwt.sign({ sub, email, role }, getJwtSecret(), { expiresIn: "7d" });
}
