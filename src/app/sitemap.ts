import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/menu"), changeFrequency: "daily", priority: 0.9 },
  ];
}
