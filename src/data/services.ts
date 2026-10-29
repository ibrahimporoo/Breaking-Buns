import type { IconName } from "@/components/ui/Icon";

export const SERVICES: readonly {
  id: string;
  label: string;
  icon: IconName;
}[] = [
  { id: "online-orders", label: "Easy Online Orders", icon: "shoppingBag" },
  { id: "fresh", label: "Fresh Every Day", icon: "sparkles" },
  { id: "fast-delivery", label: "Fast Delivery", icon: "clock" },
  { id: "pickup", label: "Quick Pickup", icon: "mapPin" },
  { id: "pay-your-way", label: "Pay Online or In Cash", icon: "shieldCheck" },
  { id: "crew", label: "Made by Pros", icon: "chefHat" },
];
