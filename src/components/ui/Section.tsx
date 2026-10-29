import type { ComponentPropsWithoutRef } from "react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  flushTop?: boolean;
};

export default function Section({
  flushTop = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative pb-20 lg:pb-28",
        flushTop ? "pt-0" : "pt-20 lg:pt-28",
        className,
      )}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  );
}
