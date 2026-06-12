import { redirect } from "next/navigation";
import { trackAffiliateClick } from "@/lib/cms";

export async function handleAffiliateRedirect(slug: string) {
  const destination = await trackAffiliateClick(slug);
  if (destination) redirect(destination);
  redirect("/");
}
