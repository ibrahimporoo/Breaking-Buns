import type { MenuCategoryView } from "@/db/queries/menu";
import { IMAGES } from "@/data/images";

type SeedItem = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  isFeatured?: boolean;
};

type SeedCategory = {
  slug: string;
  name: string;
  items: SeedItem[];
};

/** Starting menu. The seed script writes it to the database; owners edit it in the dashboard. */
export const SEED_MENU: readonly SeedCategory[] = [
  {
    slug: "burgers",
    name: "Signature Burgers",
    items: [
      {
        slug: "classic-smash",
        name: "Classic Smash",
        description: "Smashed beef patty, American cheese, pickles, onions and house sauce on a toasted brioche bun.",
        priceCents: 999,
        imageUrl: IMAGES.menu.classic,
        isFeatured: true,
      },
      {
        slug: "double-smash",
        name: "Double Smash",
        description: "Two crispy-edged patties, double cheese, caramelised onions and our smoky sauce.",
        priceCents: 1299,
        imageUrl: IMAGES.menu.double,
        isFeatured: true,
      },
      {
        slug: "bacon-breaker",
        name: "Bacon Breaker",
        description: "Thick-cut bacon, aged cheddar, crispy onion strings and BBQ glaze.",
        priceCents: 1399,
        imageUrl: IMAGES.menu.stacked,
        isFeatured: true,
      },
      {
        slug: "mushroom-swiss",
        name: "Mushroom Swiss",
        description: "Garlic-sautéed mushrooms, melted Swiss and truffle mayo.",
        priceCents: 1349,
        imageUrl: IMAGES.menu.classic,
      },
      {
        slug: "inferno-jalapeno",
        name: "Inferno Jalapeño",
        description: "Pepper jack, pickled jalapeños, chipotle sauce. Brings the heat.",
        priceCents: 1349,
        imageUrl: IMAGES.menu.double,
      },
      {
        slug: "garden-veggie",
        name: "Garden Veggie",
        description: "Crispy chickpea patty, avocado, tomato, lettuce and herb yogurt.",
        priceCents: 1199,
        imageUrl: IMAGES.menu.stacked,
      },
    ],
  },
  {
    slug: "chicken",
    name: "Chicken Buns",
    items: [
      {
        slug: "crispy-chicken-bun",
        name: "Crispy Chicken Bun",
        description: "Buttermilk fried chicken, slaw and honey mustard in a soft potato bun.",
        priceCents: 1149,
        imageUrl: IMAGES.menu.chicken,
        isFeatured: true,
      },
      {
        slug: "nashville-hot-bun",
        name: "Nashville Hot Bun",
        description: "Fiery hot-oil chicken, pickles and cooling ranch.",
        priceCents: 1249,
        imageUrl: IMAGES.menu.chicken,
      },
    ],
  },
  {
    slug: "sides",
    name: "Sides",
    items: [
      {
        slug: "hand-cut-fries",
        name: "Hand-Cut Fries",
        description: "Skin-on, twice fried, sea salt.",
        priceCents: 449,
        imageUrl: IMAGES.menu.fries,
        isFeatured: true,
      },
      {
        slug: "onion-rings",
        name: "Onion Rings",
        description: "Beer-battered, golden and crunchy.",
        priceCents: 549,
        imageUrl: IMAGES.menu.fries,
      },
      {
        slug: "mac-cheese-bites",
        name: "Mac & Cheese Bites",
        description: "Crumb-crusted bites with a molten cheddar centre.",
        priceCents: 599,
        imageUrl: IMAGES.menu.fries,
      },
    ],
  },
  {
    slug: "drinks",
    name: "Drinks",
    items: [
      {
        slug: "vanilla-shake",
        name: "Vanilla Milkshake",
        description: "Thick, creamy, made with real vanilla.",
        priceCents: 649,
        imageUrl: IMAGES.menu.shake,
      },
      {
        slug: "chocolate-shake",
        name: "Chocolate Milkshake",
        description: "Dark chocolate, whipped cream on top.",
        priceCents: 649,
        imageUrl: IMAGES.menu.shake,
      },
      {
        slug: "fresh-lemonade",
        name: "Fresh Lemonade",
        description: "Squeezed to order, lightly sweet.",
        priceCents: 399,
        imageUrl: IMAGES.menu.shake,
      },
    ],
  },
  {
    slug: "desserts",
    name: "Desserts",
    items: [
      {
        slug: "brownie-sundae",
        name: "Brownie Sundae",
        description: "Warm fudge brownie, vanilla ice cream, chocolate sauce.",
        priceCents: 699,
        imageUrl: IMAGES.menu.brownie,
      },
    ],
  },
];

/** Shown only if the database cannot be reached, so the site never looks broken. */
export const FALLBACK_MENU: MenuCategoryView[] = SEED_MENU.map((category) => ({
  id: category.slug,
  slug: category.slug,
  name: category.name,
  items: category.items.map((item) => ({
    id: item.slug,
    categoryId: category.slug,
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    imageUrl: item.imageUrl,
    isAvailable: true,
    isFeatured: item.isFeatured ?? false,
  })),
}));
