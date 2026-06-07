import { NextRequest, NextResponse } from "next/server";
import { getAds } from "@/lib/cms";

export async function GET(request: NextRequest) {
  const position = request.nextUrl.searchParams.get("position") || undefined;
  const ads = await getAds(position);
  return NextResponse.json(ads);
}
