"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type Direction = "up" | "left" | "right" | "none";

const OFFSETS: Record<Direction, { x: string; y: string }> = {
  up: { x: "0px", y: "32px" },
  left: { x: "-48px", y: "0px" },
  right: { x: "48px", y: "0px" },
  none: { x: "0px", y: "0px" },
};

type RevealProps = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const offset = OFFSETS[direction];
  const style = {
    "--reveal-x": offset.x,
    "--reveal-y": offset.y,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={style}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}
