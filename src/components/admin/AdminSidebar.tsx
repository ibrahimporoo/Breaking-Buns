"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { ADMIN_NAV } from "@/config/admin";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export default function AdminSidebar({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-surface/40 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
        <Link href="/admin" className="font-serif text-2xl tracking-tight text-ink">
          {siteConfig.name}
        </Link>
        <p className="text-xs uppercase tracking-widest text-ink/50 lg:mt-1">
          Admin
        </p>
      </div>

      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4 lg:pb-0">
        {ADMIN_NAV.filter((item) => isOwner || !item.ownerOnly).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-accent/15 text-accent"
                  : "text-ink/70 hover:bg-white/5 hover:text-ink",
              )}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
