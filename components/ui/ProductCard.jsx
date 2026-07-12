"use client";
import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import css from "./ProductCard.module.css";
import Icon from "./Icon";
import { getVariants, getPriceRange, getOptionPreview, formatINR } from "@/lib/utils/variants";
import { titleCase } from "@/lib/utils/format";

/**
 * Premium, variant-aware product card. Reused across Home / Category / Related.
 * Gracefully falls back to a "TOS" wordmark when no image is available.
 */
function ProductCard({ product, onQuickView }) {
  const [imgError, setImgError] = useState(false);
  if (!product || !product._id) return null;

  const id = String(product._id);
  const href = `/products/${id}`;
  const img = product.images?.[0]?.url;
  const showImage = img && !imgError;

  const variants = getVariants(product);
  const range = getPriceRange(product);
  const preview = getOptionPreview(product);
  const totalStock =
    variants.length > 0
      ? variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
      : Number(product.stock) || 0;

  return (
    <article className={css.card}>
      <div className={css.mediaWrap}>
        <Link href={href} className={css.media} aria-label={product.name}>
          {showImage ? (
            <Image
              src={img}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className={css.img}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={css.fallback}><span>TOS</span></div>
          )}

          <div className={css.badges}>
            {product.featured && (
              <span className={`${css.badge} ${css.featured}`}>
                <Icon name="star" size={12} /> Featured
              </span>
            )}
            {variants.length > 0 && (
              <span className={`${css.badge} ${css.variantBadge}`}>{variants.length} sizes</span>
            )}
          </div>

          {totalStock > 0 ? (
            totalStock < 10 && (
              <span className={`${css.stock} ${css.low}`}>Only {totalStock} left</span>
            )
          ) : (
            <span className={`${css.stock} ${css.out}`}>Made to order</span>
          )}
        </Link>

        {onQuickView && (
          <button
            type="button"
            className={css.quickView}
            onClick={() => onQuickView(id)}
          >
            <Icon name="search" size={16} /> Quick View
          </button>
        )}
      </div>

      <div className={css.body}>
        {product.category?.name && (
          <span className={css.chip}>{titleCase(product.category.name)}</span>
        )}
        <Link href={href} className={css.titleLink}>
          <h3 className={css.title}>{titleCase(product.name) || "Unnamed Product"}</h3>
        </Link>

        {preview && (
          <div className={css.optPreview}>
            <span className={css.optName}>{preview.name}</span>
            <span className={css.optValues}>
              {preview.shown.join(" • ")}
              {preview.extra > 0 && <span className={css.optMore}> • +{preview.extra} more</span>}
            </span>
          </div>
        )}

        <div className={css.footer}>
          <div className={css.priceBlock}>
            {!range.single && <span className={css.from}>Starting from</span>}
            <span className={css.price}>{formatINR(range.min)}</span>
          </div>
          <Link href={href} className={css.quote}>
            Get Quote <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
