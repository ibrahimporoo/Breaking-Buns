import PillButton from "@/components/ui/PillButton";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import Section from "@/components/ui/Section";
import { bodyClass, titleClass } from "@/components/ui/styles";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/cn";

export default function Gallery() {
  return (
    <Section id="gallery">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal direction="left" className="order-2 lg:order-1">
          <div className="relative mx-auto aspect-6/5 w-full max-w-xl">
            <div className="group absolute inset-y-1/12 left-1/20 right-0 overflow-hidden rounded-3xl border border-line bg-surface">
              <SafeImage
                src={IMAGES.gallery.main}
                alt="Stacked cheeseburger with lettuce and tomato on a wooden board"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover transition-transform duration-1600 ease-out group-hover:scale-105"
              />
            </div>

            <div className="absolute right-0 top-0 aspect-square w-3/10 animate-float overflow-hidden rounded-2xl bg-surface ring-10 ring-canvas">
              <SafeImage
                src={IMAGES.gallery.fries}
                alt="Golden French fries in a paper cone"
                fill
                sizes="(min-width: 1024px) 12vw, 28vw"
                className="object-cover"
              />
            </div>

            <div
              style={{ animationDelay: "-3s" }}
              className="absolute bottom-0 left-0 aspect-square w-1/4 animate-float overflow-hidden rounded-2xl bg-surface ring-10 ring-canvas"
            >
              <SafeImage
                src={IMAGES.gallery.shake}
                alt="Creamy milkshake topped with whipped cream"
                fill
                sizes="(min-width: 1024px) 10vw, 22vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <h2 className={titleClass}>
              Messy in the
              <br />
              best way
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className={cn(bodyClass, "mt-5 max-w-sm")}>
              Juicy patties, melted cheese, crunchy fries and thick shakes. Order
              for yourself or the whole table. We cook it fresh and bring it to you.
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
