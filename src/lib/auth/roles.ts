export const ROLES = ["customer", "staff", "owner"] as const;

export type Role = (typeof ROLES)[number];

const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  staff: "Staff",
  owner: "Owner",
};

const STAFF_ROLES: readonly string[] = ["staff", "owner"];

export function isStaff(
  role: string | null | undefined,
): role is "staff" | "owner" {
  return role != null && STAFF_ROLES.includes(role);
}

function isRole(value: string | null | undefined): value is Role {
  return ROLES.some((role) => role === value);
}

export function getRoleLabel(role: string | null | undefined): string {
  return isRole(role) ? ROLE_LABELS[role] : ROLE_LABELS.customer;
}
