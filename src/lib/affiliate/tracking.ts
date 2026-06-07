import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function trackAffiliateClick(slug: string) {
  const link = await prisma.affiliateLink.findUnique({ where: { slug, active: true } });
  if (!link) return null;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const referer = headersList.get("referer") || undefined;

  await prisma.$transaction([
    prisma.affiliateClick.create({
      data: {
        linkId: link.id,
        userAgent,
        referer,
        ipHash: "anonymous",
      },
    }),
    prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    }),
  ]);

  return link.destination;
}

export async function handleAffiliateRedirect(slug: string) {
  const destination = await trackAffiliateClick(slug);
  if (destination) redirect(destination);
  redirect("/");
}
