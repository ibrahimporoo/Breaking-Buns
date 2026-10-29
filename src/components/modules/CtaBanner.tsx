import PillButton from "@/components/ui/PillButton";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import Section from "@/components/ui/Section";
import { bodyClass, titleClass } from "@/components/ui/styles";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/cn";

export default function CtaBanner() {
  return (
    <Section id="cta" flushTop>
      <div className="group relative isolate flex min-h-104 items-center overflow-hidden rounded-3xl border border-line bg-surface lg:min-h-120">
        <SafeImage
          src={IMAGES.cta.background}
          alt="Burger stacked high with cheese, bacon and fresh vegetables"
          fill
          sizes="(min-width: 1440px) 1344px, 100vw"
          className="object-cover object-right transition-transform duration-2000 ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-canvas via-canvas/75 to-transparent"
          aria-hidden="true"
        />

        <div className="relative max-w-xl p-8 sm:p-12 lg:p-16">
          <Reveal>
            <h2 className={titleClass}>
              Hungry? We&apos;re
              <br />
              Already Cooking
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className={cn(bodyClass, "mt-5 max-w-sm")}>
              Pick your favorites, choose delivery or pickup, and pay online or in cash.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-8">
            <PillButton href="/menu">Order Now</PillButton>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
