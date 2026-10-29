import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import { bodyClass, titleClass } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title: ReactNode;
  description: string;
  className?: string;
};

export default function SectionHeading({
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <Reveal>
        <h2 className={titleClass}>{title}</h2>
      </Reveal>
      <Reveal direction="right" delay={150}>
        <p className={cn(bodyClass, "max-w-88 md:mt-3")}>{description}</p>
      </Reveal>
    </div>
  );
}
