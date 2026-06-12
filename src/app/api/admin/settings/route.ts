import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { getSettings, saveSettings } from "@/lib/cms";
import { settingsSchema } from "@/lib/admin/validation";
import { shouldUseDatabase } from "@/lib/db/is-enabled";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({ ...settings, databaseMode: shouldUseDatabase() });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = settingsSchema.parse(await request.json());
    const settings = await saveSettings(body);
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
