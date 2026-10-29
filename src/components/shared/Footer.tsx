import Link from "next/link";
import Container from "@/components/ui/Container";
import Icon, { type IconName } from "@/components/ui/Icon";
import {
  FOOTER_LINKS,
  LEGAL_LINKS,
  SOCIAL_LINKS,
  siteConfig,
} from "@/config/site";

const headingClass = "font-serif text-lg text-ink";
const linkClass = "text-sm text-ink/70 transition-colors hover:text-accent";

const { contact } = siteConfig;

const CONTACT_ITEMS: readonly {
  icon: IconName;
  label: string;
  href?: string;
}[] = [
  { icon: "mapPin", label: contact.address },
  {
    icon: "phone",
    label: contact.phone,
    href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
  },
  { icon: "mail", label: contact.email, href: `mailto:${contact.email}` },
  { icon: "clock", label: contact.hours },
];

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-line pt-16 lg:pt-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-serif text-5xl tracking-tight text-ink sm:text-6xl"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-3 font-serif text-sm text-ink/70">
              {siteConfig.tagline}
            </p>

            <h3 className={`${headingClass} mt-10`}>Visit Us</h3>
            <ul className="mt-4 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-full border border-white/15 text-ink transition duration-300 hover:-translate-y-1 hover:border-accent hover:bg-accent"
                  >
                    <Icon name={social.icon} className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <h3 className={headingClass}>{siteConfig.name}</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={headingClass}>Connect With Us</h3>
            <ul className="mt-4 space-y-3">
              {CONTACT_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <Icon
                    name={item.icon}
                    className="mt-0.5 size-4 shrink-0 text-ink/80"
                  />
                  {item.href ? (
                    <a href={item.href} className={linkClass}>
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm text-ink/70">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line py-6 text-xs text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {LEGAL_LINKS.map((link, index) => (
              <li key={link.label} className="flex items-center gap-3">
                {index > 0 && <span aria-hidden="true">|</span>}
                <Link
                  href={link.href}
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
