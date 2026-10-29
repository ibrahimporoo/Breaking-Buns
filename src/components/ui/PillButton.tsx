import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type PillButtonSize = "md" | "sm";

type PillButtonProps = Omit<ComponentProps<typeof Link>, "children"> & {
  children: ReactNode;
  size?: PillButtonSize;
};

const SIZES: Record<
  PillButtonSize,
  { link: string; badge: string; icon: string }
> = {
  md: {
    link: "gap-4 py-1.5 pl-6 pr-1.5 text-base sm:text-[1.05rem]",
    badge: "size-10 sm:size-11",
    icon: "size-5",
  },
  sm: {
    link: "gap-3 py-1 pl-4 pr-1 text-sm",
    badge: "size-8",
    icon: "size-4",
  },
};

export default function PillButton({
  children,
  size = "md",
  className,
  ...props
}: PillButtonProps) {
  const styles = SIZES[size];

  return (
    <Link
      {...props}
      className={cn(
        "group inline-flex items-center rounded-full bg-accent font-serif font-semibold text-white shadow-accent transition duration-300 hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        styles.link,
        className,
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-black text-white",
          styles.badge,
        )}
      >
        <Icon
          name="arrowUpRight"
          className={cn(
            "transition-transform duration-300 group-hover:rotate-45",
            styles.icon,
          )}
        />
      </span>
    </Link>
  );
}
