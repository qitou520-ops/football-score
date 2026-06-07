import "server-only";

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AdminSession {
  sub: string;
  email: string;
  role?: string;
}

export function verifyAdminToken(token?: string | null): AdminSession | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
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
