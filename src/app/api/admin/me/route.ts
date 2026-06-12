import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { shouldUseDatabase } from "@/lib/db/is-enabled";

export async function GET(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    email: user.email,
    role: user.role ?? "admin",
    databaseMode: shouldUseDatabase(),
  });
}
