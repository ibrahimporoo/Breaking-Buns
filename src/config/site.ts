import type { IconName } from "@/components/ui/Icon";

export const siteConfig = {
  name: "Breaking Buns",
  tagline: "Stacked Right. Delivered Fast.",
  description:
    "Smash burgers, crispy chicken buns and hand-cut fries, cooked to order and delivered hot to your door.",
  contact: {
    address: "123 Culinary Avenue, New York, NY",
    phone: "+1 (800) 555-1234",
    email: "hello@breakingbuns.com",
    hours: "Mon–Sun: 11AM – 11PM",
  },
} as const;

export type NavLink = {
  label: string;
  href: string;
  /** Section id on the home page, used to highlight the link while scrolling. */
  section?: string;
};

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/", section: "home" },
  { label: "Menu", href: "/menu" },
  { label: "About Us", href: "/#about", section: "about" },
  { label: "Gallery", href: "/#gallery", section: "gallery" },
  { label: "Contact", href: "/#contact", section: "contact" },
];

export const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Menu", href: "/menu" },
  { label: "Order Online", href: "/menu" },
  { label: "Checkout", href: "/checkout" },
  { label: "Owner Login", href: "/owner" },
] as const;

export const SOCIAL_LINKS: readonly {
  label: string;
  href: string;
  icon: IconName;
}[] = [
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "Google", href: "https://google.com", icon: "google" },
];

export const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Accessibility", href: "#" },
] as const;
