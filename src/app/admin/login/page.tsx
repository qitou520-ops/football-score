import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (verifyAdminToken(cookieStore.get("admin_token")?.value)) {
    redirect("/admin/dashboard");
  }
  return <AdminLoginForm />;
}
