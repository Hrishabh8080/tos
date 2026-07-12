"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import css from "./Home.module.css";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ui/ProductCard";
import Icon from "@/components/ui/Icon";
import { deduplicatedFetch } from "@/lib/utils/fetchCache";

/**
 * Data-driven product carousel/grid. Reuses the existing /api/products endpoint
 * (no new backend). Shows skeletons while loading and can hide itself when empty.
 */
export default function ProductRail({
  eyebrow,
  title,
  subtitle,
  endpoint = "/api/products",
  limit = 4,
  viewAllHref = "/products",
  hideIfEmpty = false,
  tone = "light",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const CACHE_KEY = `tos_rail_${endpoint}`;
    const DUR = 5 * 60 * 1000;

    // Serve from cache and skip the network when fresh (no re-fetch on reload)
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (c?.data && c?.timestamp && Date.now() - c.timestamp < DUR) {
        setProducts(c.data);
        setLoading(false);
        return () => { alive = false; };
      }
    } catch {}

    (async () => {
      try {
        const res = await deduplicatedFetch(endpoint);
        if (!res.ok) throw new Error("bad response");
        const ct = res.headers.get("content-type");
        if (!ct?.includes("application/json")) throw new Error("not json");
        const data = await res.json();
        if (alive && Array.isArray(data)) {
          const sliced = data.filter((p) => p && p.category).slice(0, limit);
          setProducts(sliced);
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: sliced, timestamp: Date.now() })); } catch {}
        }
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [endpoint, limit]);

  if (!loading && hideIfEmpty && products.length === 0) return null;

  return (
    <section className={css.section} style={tone === "soft" ? { background: "var(--bg-soft)" } : undefined}>
      <div className={css.inner}>
        <div className={css.railHead}>
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <Link href={viewAllHref} className={css.viewAll}>
            View All Products <Icon name="arrow" size={16} />
          </Link>
        </div>

        {loading ? (
          <div className={css.railGrid}>
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className={css.skeleton}>
                <div className={css.skelMedia} />
                <div className={css.skelBody}>
                  <div className={`${css.skelLine} ${css.short}`} />
                  <div className={css.skelLine} />
                  <div className={`${css.skelLine} ${css.short}`} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={css.railGrid}>
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className={css.railEmpty}>
            No products to show yet. <Link href={viewAllHref} style={{ color: "var(--secondary)", fontWeight: 600 }}>Browse the catalogue →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
