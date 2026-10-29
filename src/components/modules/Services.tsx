import Icon from "@/components/ui/Icon";
import PillButton from "@/components/ui/PillButton";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import Section from "@/components/ui/Section";
import { bodyClass, titleClass } from "@/components/ui/styles";
import { IMAGES } from "@/data/images";
import { SERVICES } from "@/data/services";
import { cn } from "@/lib/cn";

export default function Services() {
  return (
    <Section id="about">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-8">
        <div>
          <Reveal>
            <h2 className={titleClass}>
              Why Hungry
              <br />
              People Pick Us
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className={cn(bodyClass, "mt-5 max-w-md")}>
              Great burgers are only half of it. Ordering is simple, delivery is
              quick, and you choose how to pay: online or with cash at the door.
            </p>
          </Reveal>

          <ul className="mt-8 grid max-w-md grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {SERVICES.map((service, index) => (
              <li key={service.id}>
                <Reveal delay={150 + index * 70} className="group flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon name={service.icon} className="size-5" />
                  </span>
                  <span className="font-serif text-sm text-ink sm:text-base">
                    {service.label}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={600} className="mt-10">
            <PillButton href="/menu">Order Now</PillButton>
          </Reveal>
        </div>

        <Reveal direction="right" className="mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-5/6 w-full">
            <div className="absolute bottom-0 right-0 h-5/6 w-3/4 overflow-hidden rounded-3xl border border-line bg-surface">
              <SafeImage
                src={IMAGES.services.crew}
                alt="Smiling restaurant crew member holding a tray of burgers"
                fill
                sizes="(min-width: 1024px) 30vw, 70vw"
                className="object-cover object-top"
              />
            </div>

            <div className="absolute left-0 top-0 aspect-square w-2/5 animate-float overflow-hidden rounded-2xl border border-line bg-surface shadow-plate">
              <SafeImage
                src={IMAGES.services.plate}
                alt="Burger with melted cheese on a dark background"
                fill
                sizes="(min-width: 1024px) 14vw, 30vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
