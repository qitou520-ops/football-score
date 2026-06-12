import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { getTodayFixtures } from "@/lib/data";
import { localizeFixtures } from "@/lib/translations/localize-fixture";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fixtures = localizeFixtures(await getTodayFixtures().catch(() => []), "zh");
  const items = fixtures.map((f) => ({
    id: f.fixture.id,
    date: f.fixture.date,
    status: f.fixture.status.short,
    league: f.league.name,
    home: f.teams.home.name,
    away: f.teams.away.name,
    label: `${f.teams.home.name} vs ${f.teams.away.name}`,
  }));

  return NextResponse.json({ fixtures: items });
}
