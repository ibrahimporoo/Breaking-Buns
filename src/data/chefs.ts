import { IMAGES } from "@/data/images";

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  alt: string;
};

export const CREW: readonly CrewMember[] = [
  {
    id: "james-carlow",
    name: "James Carlow",
    role: "Head Griller",
    image: IMAGES.crew.one,
    alt: "Portrait of James Carlow, head griller, in a chef's uniform",
  },
  {
    id: "elena-morin",
    name: "Elena Morin",
    role: "Sauce Master",
    image: IMAGES.crew.two,
    alt: "Portrait of Elena Morin, sauce master, in a chef's uniform",
  },
  {
    id: "takeshi-ito",
    name: "Takeshi Ito",
    role: "Bun Baker",
    image: IMAGES.crew.three,
    alt: "Portrait of Takeshi Ito, bun baker, in a chef's uniform",
  },
];
