import SafeImage from "@/components/ui/SafeImage";
import type { Testimonial } from "@/data/testimonials";

export default function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/30">
      <figcaption className="flex items-center gap-3">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-canvas ring-1 ring-white/10">
          <SafeImage
            src={testimonial.avatar}
            alt={`Portrait of ${testimonial.name}`}
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>
        <span>
          <span className="block font-serif text-base text-ink">
            {testimonial.name}
          </span>
          <span className="block text-xs text-ink/60">{testimonial.role}</span>
        </span>
      </figcaption>

      <blockquote className="mt-5 font-serif text-sm leading-relaxed text-ink/80 sm:text-base">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </figure>
  );
}
