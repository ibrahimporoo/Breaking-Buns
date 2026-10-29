"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartButton from "@/components/cart/CartButton";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import PillButton from "@/components/ui/PillButton";
import { NAV_LINKS, siteConfig, type NavLink } from "@/config/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/cn";

const SECTION_IDS = NAV_LINKS.flatMap((link) => (link.section ? [link.section] : []));

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeId = useActiveSection(SECTION_IDS);
  const pathname = usePathname();

  const isLinkActive = (link: NavLink) =>
    link.section ? pathname === "/" && link.section === activeId : pathname.startsWith(link.href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 animate-fade-down border-b transition-colors duration-300",
        solid
          ? "border-line bg-canvas/75 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-20 items-center justify-between lg:grid lg:h-24 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="justify-self-start font-serif text-2xl font-medium tracking-tight text-ink sm:text-[1.75rem]"
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9 xl:gap-11">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? (link.section ? "location" : "page") : undefined}
                    className={cn(
                      "relative font-serif text-[0.98rem] transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-accent after:transition-transform after:duration-300 hover:text-accent hover:after:scale-x-100",
                      isActive
                        ? "text-ink after:scale-x-100"
                        : "text-ink/70 after:scale-x-0",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <div className="hidden sm:block">
            <PillButton href="/menu">Order Now</PillButton>
          </div>

          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/4 text-ink transition-colors hover:bg-white/10 lg:hidden"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="size-5" />
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 lg:hidden",
          menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <nav aria-label="Mobile" className="px-5 pb-6 pt-2 sm:px-8">
            <ul className="flex flex-col divide-y divide-line">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block py-3.5 font-serif text-xl transition-colors hover:text-accent",
                      isLinkActive(link) ? "text-accent" : "text-ink/85",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <PillButton
              href="/menu"
              onClick={() => setMenuOpen(false)}
              className="mt-5 w-full justify-between sm:hidden"
            >
              Order Now
            </PillButton>
          </nav>
        </div>
      </div>
    </header>
  );
}
