import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/admin/auth";

export default async function AdminIndexPage() {
  const cookieStore = await cookies();
  if (verifyAdminToken(cookieStore.get("admin_token")?.value)) {
    redirect("/admin/dashboard");
  }
  redirect("/admin/login");
}
