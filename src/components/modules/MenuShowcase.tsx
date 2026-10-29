import Link from "next/link";
import Carousel from "@/components/ui/Carousel";
import MenuCard from "@/components/ui/MenuCard";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { getFeaturedItems } from "@/db/queries/menu";

export default async function MenuShowcase() {
  const items = await getFeaturedItems();

  return (
    <Section id="menu">
      <SectionHeading
        title={
          <>
            Our Fan
            <br />
            Favorites
          </>
        }
        description="Smashed, stacked and served hot. Add your picks to the cart and we will take it from there."
      />

      <div className="mt-12 lg:mt-16">
        <Carousel label="Featured dishes">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </Carousel>
      </div>

      <Reveal className="mt-10 text-center">
        <Link
          href="/menu"
          className="font-serif text-lg text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline"
        >
          See the full menu
        </Link>
      </Reveal>
    </Section>
  );
}
