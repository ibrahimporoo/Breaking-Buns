import Link from "next/link";
import SignOutButton from "@/components/admin/SignOutButton";
import { getRoleLabel } from "@/lib/auth/roles";

type AdminHeaderProps = {
  name: string;
  role: string | null | undefined;
};

export default function AdminHeader({ name, role }: AdminHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-8">
      <div>
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-ink/60">{getRoleLabel(role)}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-ink/70 transition-colors hover:text-accent"
        >
          View site
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
