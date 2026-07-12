import { SITE } from "@/lib/site";

/** Static SEO metadata for the product listing. (Per-product pages override this
 *  via app/products/[id]/layout.jsx generateMetadata.) */
export const metadata = {
  title: "Products — Wholesale Electrical & Office Supplies",
  description:
    "Browse Total Office Solutions' catalogue of genuine electrical products, wires, cables, switchgear and office supplies at wholesale rates. Bulk supply, corporate orders, fast delivery, authorized brands.",
  alternates: { canonical: `${SITE.url}/products` },
  openGraph: {
    type: "website",
    title: "Products — Total Office Solutions",
    description: "Wholesale electrical & office supplies for businesses — bulk pricing, genuine brands, fast delivery.",
    url: `${SITE.url}/products`,
  },
};

export default function ProductsLayout({ children }) {
  return children;
}
