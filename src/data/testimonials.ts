import { IMAGES } from "@/data/images";

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "sophia-m",
    name: "Sophia M",
    role: "Food Critic",
    quote:
      "The best smash burger I have had in years. Juicy, crispy edges, perfectly toasted bun, and it arrived still hot.",
    avatar: IMAGES.patrons.sophia,
  },
  {
    id: "daniel-l",
    name: "Daniel L",
    role: "Burger Enthusiast",
    quote:
      "Ordering took a minute, delivery took twenty. The bacon burger and fries are my new Friday ritual.",
    avatar: IMAGES.patrons.daniel,
  },
  {
    id: "ava-r",
    name: "Ava R",
    role: "Lifestyle Blogger",
    quote:
      "Easy ordering, friendly crew and flavors that make you smile. Paying on delivery made it effortless.",
    avatar: IMAGES.patrons.ava,
  },
];
