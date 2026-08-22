import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar, AdminMobileNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  // Defense in depth: middleware already blocks non-admins, re-check here too.
  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    redirect("/dang-nhap");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
