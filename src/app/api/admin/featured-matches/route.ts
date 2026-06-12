import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import {
  getAllFeaturedMatches,
  saveFeaturedMatch,
  deleteFeaturedMatch,
} from "@/lib/cms";
import { featuredMatchSchema } from "@/lib/admin/validation";
import { getFixtureById } from "@/lib/data";
import { localizeFixture } from "@/lib/translations/localize-fixture";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getAllFeaturedMatches();
  const enriched = await Promise.all(
    items.map(async (item) => {
      const raw = await getFixtureById(item.matchId).catch(() => null);
      const fixture = raw ? localizeFixture(raw, "zh") : null;
      return {
        ...item,
        preview: fixture
          ? `${fixture.teams.home.name} vs ${fixture.teams.away.name}`
          : null,
        kickoff: fixture?.fixture.date ?? null,
      };
    })
  );
  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data = featuredMatchSchema.parse(body);
    const item = await saveFeaturedMatch(data);
    return NextResponse.json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteFeaturedMatch(id);
  return NextResponse.json({ success: true });
}
