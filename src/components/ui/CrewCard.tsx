import SafeImage from "@/components/ui/SafeImage";
import type { CrewMember } from "@/data/chefs";

export default function CrewCard({ member }: { member: CrewMember }) {
  return (
    <article className="group">
      <div className="relative aspect-5/4 overflow-hidden rounded-3xl border border-line bg-surface">
        <SafeImage
          src={member.image}
          alt={member.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-canvas/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-5 text-center font-serif text-xl text-ink transition-colors duration-300 group-hover:text-accent sm:text-2xl">
        {member.name}
      </h3>
      <p className="mt-1 text-center text-sm text-ink-muted">{member.role}</p>
    </article>
  );
}
