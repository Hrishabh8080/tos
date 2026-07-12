import { getProductForSeo } from "@/lib/data/products";
import { getVariants, getPriceRange } from "@/lib/utils/variants";
import { SITE } from "@/lib/site";

/** Per-product SEO metadata — server-rendered (the page itself stays a client component). */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductForSeo(id);
  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: true } };
  }
  const desc = (product.description || `Buy ${product.name} at wholesale rates from Total Office Solutions — bulk supply, genuine brands, GST invoicing.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const img = product.images?.[0]?.url;
  const url = `${SITE.url}/products/${product.slug || product._id}`;
  return {
    title: product.name,
    description: desc,
    keywords: [product.name, product.category?.name, "wholesale", "bulk", "B2B"].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: product.name,
      description: desc,
      url,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc,
      images: img ? [img] : undefined,
    },
  };
}

/** Injects server-rendered Product JSON-LD (schema.org) for rich results. */
export default async function ProductLayout({ children, params }) {
  const { id } = await params;
  const product = await getProductForSeo(id);

  let jsonLd = null;
  let breadcrumb = null;
  if (product) {
    const variants = getVariants(product);
    const range = getPriceRange(product);
    const offers = variants.length
      ? { "@type": "AggregateOffer", lowPrice: range.min, highPrice: range.max, offerCount: variants.length, priceCurrency: "INR" }
      : { "@type": "Offer", price: product.price, priceCurrency: "INR", availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder" };

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: (product.images || []).map((i) => i.url).filter(Boolean),
      category: product.category?.name,
      sku: product.sku || undefined,
      brand: { "@type": "Brand", name: product.category?.name || SITE.name },
      offers,
    };

    // Breadcrumb schema
    breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Products", item: `${SITE.url}/products` },
        { "@type": "ListItem", position: 3, name: product.name },
      ],
    };
  }

  return (
    <>
      {jsonLd && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        </>
      )}
      {children}
    </>
  );
}
