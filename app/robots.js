import { SITE } from "@/lib/site";

/** robots.txt via the App Router Metadata API. */
export default function robots() {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
