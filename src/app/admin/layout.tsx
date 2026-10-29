import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Breaking Buns Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireStaff();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <AdminSidebar isOwner={user.role === "owner"} />
      <div className="flex min-w-0 flex-col">
        <AdminHeader name={user.name} role={user.role} />
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
