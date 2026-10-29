"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

const GAP_PX = 24;

type CarouselProps = {
  label: string;
  children: ReactNode;
};

type ArrowButtonProps = {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
};

function ArrowButton({ direction, disabled, onClick }: ArrowButtonProps) {
  const isLeft = direction === "left";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Previous" : "Next"}
      className="text-ink transition hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon
        name={isLeft ? "arrowLeft" : "arrowRight"}
        strokeWidth={1.2}
        className="h-6 w-8"
      />
    </button>
  );
}

export default function Carousel({ label, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    track.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    const firstSlide = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstSlide) return;
    track.scrollBy({
      left: direction * (firstSlide.offsetWidth + GAP_PX),
      behavior: "smooth",
    });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 pt-2 scrollbar-none focus-visible:outline-hidden [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child, index) => (
          <div
            role="group"
            aria-roledescription="slide"
            className="shrink-0 basis-4/5 snap-start sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]"
          >
            <Reveal delay={index * 120}>{child}</Reveal>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <ArrowButton
          direction="left"
          disabled={!canScrollPrev}
          onClick={() => scrollByCard(-1)}
        />
        <ArrowButton
          direction="right"
          disabled={!canScrollNext}
          onClick={() => scrollByCard(1)}
        />
      </div>
    </div>
  );
}
