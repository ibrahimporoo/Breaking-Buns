import Carousel from "@/components/ui/Carousel";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { TESTIMONIALS } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeading
        title={
          <>
            Loved by
            <br />
            Our Customers
          </>
        }
        description="Real voices. Honest praise. Happy bites delivered to doorsteps every day."
      />

      <div className="mt-12 lg:mt-16">
        <Carousel label="Customer testimonials">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </Carousel>
      </div>
    </Section>
  );
}
