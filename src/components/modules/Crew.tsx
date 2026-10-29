import Carousel from "@/components/ui/Carousel";
import CrewCard from "@/components/ui/CrewCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { CREW } from "@/data/chefs";

export default function Crew() {
  return (
    <Section id="crew">
      <SectionHeading
        title={
          <>
            Meet the
            <br />
            Crew
          </>
        }
        description="Every burger starts with people who care: grillers, bakers and sauce makers who treat each order like it is their own dinner."
      />

      <div className="mt-12 lg:mt-16">
        <Carousel label="Our crew">
          {CREW.map((member) => (
            <CrewCard key={member.id} member={member} />
          ))}
        </Carousel>
      </div>
    </Section>
  );
}
