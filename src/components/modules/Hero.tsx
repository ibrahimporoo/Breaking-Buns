import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import PillButton from "@/components/ui/PillButton";
import SafeImage from "@/components/ui/SafeImage";
import { siteConfig } from "@/config/site";
import { HERO_FEATURES } from "@/data/hero";
import { IMAGES } from "@/data/images";

const HEADLINE_LINES = ["Bite Into", "Something"] as const;

function MaskedLine({
  children,
  delay,
  className,
}: {
  children: string;
  delay: number;
  className?: string;
}) {
  return (
    <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
      <span
        className={`block animate-line-up ${className ?? ""}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-x-clip pb-20 pt-32 sm:pt-36 lg:pt-44 xl:pb-40"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="relative z-10 flex flex-col items-start">
            <h1 className="font-serif text-[2.9rem] font-normal leading-[1.04] tracking-tight text-ink sm:text-7xl lg:text-[4.25rem] xl:text-[5.5rem]">
              {HEADLINE_LINES.map((line, index) => (
                <MaskedLine key={line} delay={150 + index * 150}>
                  {line}
                </MaskedLine>
              ))}
              <MaskedLine delay={450} className="text-accent">
                Legendary
              </MaskedLine>
            </h1>

            <p
              className="mt-6 max-w-108 animate-fade-up text-base leading-relaxed text-ink-muted sm:text-lg"
              style={{ animationDelay: "700ms" }}
            >
              {siteConfig.description}
            </p>

            <div className="animate-fade-up" style={{ animationDelay: "850ms" }}>
              <PillButton href="/menu" className="mt-8">
                Order Now
              </PillButton>
            </div>
          </div>

          <div className="relative lg:mt-6">
            <svg
              viewBox="0 0 232 64"
              fill="none"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute -left-3/10 top-0 z-10 hidden w-2/5 lg:block"
              aria-hidden="true"
            >
              <path
                d="M4 14C50 2 100 4 128 18c18 10 12 26-6 24-18-2-18-20 2-26 26-8 66 10 100 36"
                pathLength={1}
                strokeDasharray={1}
                className="animate-draw"
              />
              <path
                d="M217 38l7 14-16-1"
                pathLength={1}
                strokeDasharray={1}
                className="animate-draw"
                style={{ animationDelay: "2.4s" }}
              />
            </svg>

            <div
              className="absolute inset-1/16 animate-glow rounded-full bg-accent/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="animate-plate-in">
              <div className="relative aspect-square w-full animate-float overflow-hidden rounded-full border border-white/6 bg-plate shadow-hero">
                <SafeImage
                  src={IMAGES.hero.plate}
                  alt="Juicy double cheeseburger with lettuce and tomato on a dark plate"
                  fill
                  priority
                  sizes="(min-width: 1536px) 700px, (min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            <aside
              aria-label="Highlights"
              style={{ animationDelay: "1100ms" }}
              className="relative z-20 mx-auto -mt-10 w-[calc(100%-1.5rem)] max-w-lg animate-fade-up rounded-3xl border border-white/4 bg-surface/60 p-6 backdrop-blur-md sm:p-7 xl:absolute xl:-bottom-3/20 xl:-left-1/2 xl:mx-0 xl:mt-0 xl:w-3/4 xl:max-w-none"
            >
              <ul className="divide-y divide-line">
                {HERO_FEATURES.map((feature) => (
                  <li
                    key={feature.title}
                    className="flex items-start gap-5 py-4 first:pt-0 last:pb-0"
                  >
                    <Icon
                      name={feature.icon}
                      strokeWidth={1.5}
                      className="mt-1 size-7 shrink-0 text-white"
                    />
                    <div>
                      <h3 className="font-serif text-xl leading-tight text-ink">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-ink-muted">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </Container>
    </section>
  );
}
