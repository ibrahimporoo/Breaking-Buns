import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/url";

/** schema.org Restaurant data that search engines show as rich results. */
export function restaurantJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    servesCuisine: ["Burgers", "American"],
    priceRange: "$$",
    hasMenu: absoluteUrl("/menu"),
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Culinary Avenue",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "23:00",
    },
  };
}
