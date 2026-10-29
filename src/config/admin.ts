import type { IconName } from "@/components/ui/Icon";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: IconName;
  ownerOnly?: boolean;
};

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layoutGrid" },
  { label: "Live orders", href: "/admin/orders", icon: "bell" },
  { label: "Order history", href: "/admin/history", icon: "receipt" },
  { label: "Menu", href: "/admin/menu", icon: "utensils" },
  { label: "Settings", href: "/admin/settings", icon: "settings", ownerOnly: true },
  { label: "Team", href: "/admin/team", icon: "users", ownerOnly: true },
];
