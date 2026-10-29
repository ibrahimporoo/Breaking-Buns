import type { IconName } from "@/components/ui/Icon";

export const HERO_FEATURES: readonly {
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    title: "Order Online",
    description: "Build your meal, add as many dishes as you like",
    icon: "shoppingBag",
  },
  {
    title: "Pay Your Way",
    description: "Card, Apple Pay, PayPal, or cash on delivery",
    icon: "star",
  },
  {
    title: "Fresh & Hot",
    description: "Smashed to order and at your door fast",
    icon: "flame",
  },
];
