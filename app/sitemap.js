import { SITE } from "@/lib/site";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export const revalidate = 3600; // refresh hourly

/** Dynamic sitemap (App Router Metadata API) — static routes + all active products.
 *  Never throws: if the DB is unreachable at build it falls back to static routes. */
export default async function sitemap() {
  const base = SITE.url.replace(/\/$/, "");
  const staticRoutes = [
    { url: `${base}`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/bulk-enquiry`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let productRoutes = [];
  try {
    await connectDB();
    const products = await Product.find({ isActive: true })
      .select("_id slug updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean();
    productRoutes = products.map((p) => ({
      url: `${base}/products/${p.slug || p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // DB unavailable — ship static routes only
  }

  return [...staticRoutes, ...productRoutes];
}
