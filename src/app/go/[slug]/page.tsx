import { handleAffiliateRedirect } from "@/lib/affiliate/tracking";

type Props = { params: Promise<{ slug: string }> };

export default async function AffiliateRedirectPage({ params }: Props) {
  const { slug } = await params;
  await handleAffiliateRedirect(slug);
}
