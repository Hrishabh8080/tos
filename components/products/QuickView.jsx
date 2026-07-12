"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import css from "./QuickView.module.css";
import Icon from "@/components/ui/Icon";
import { deduplicatedFetch } from "@/lib/utils/fetchCache";
import {
  getAttributes, getVariants, getDefaultSelection, findVariant, firstVariantWithValue,
  getOptionValue, valueExists, isValueAvailable, resolveActive, getPriceRange, formatINR,
} from "@/lib/utils/variants";
import { waLink } from "@/lib/site";
import { titleCase } from "@/lib/utils/format";

/**
 * Quick View modal. Lazily fetches the full product so it can show description +
 * dynamic variant selectors without bloating the list payload.
 */
export default function QuickView({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await deduplicatedFetch(`/api/products/${productId}`);
        const data = await res.json();
        if (alive) { setProduct(data); setSelection(getDefaultSelection(data)); }
      } catch { if (alive) setProduct(null); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [productId]);

  const attributes = useMemo(() => getAttributes(product), [product]);
  const variants = useMemo(() => getVariants(product), [product]);
  const hasVariants = variants.length > 0;
  const activeVariant = useMemo(() => (hasVariants ? findVariant(product, selection) : null), [product, selection, hasVariants]);
  const active = useMemo(() => resolveActive(product, activeVariant), [product, activeVariant]);
  const range = useMemo(() => getPriceRange(product), [product]);
  const img = active.image || product?.images?.[0]?.url;

  const configLabel = useMemo(
    () => attributes.map((a) => selection[a.name]).filter(Boolean).join(" / "),
    [attributes, selection]
  );

  const chooseValue = useCallback((attrName, value) => {
    const next = { ...selection, [attrName]: value };
    if (findVariant(product, next)) { setSelection(next); return; }
    const fb = firstVariantWithValue(product, attrName, value);
    if (fb) {
      const snapped = {};
      getAttributes(product).forEach((a) => { const v = getOptionValue(fb, a.name); if (v != null) snapped[a.name] = v; });
      setSelection(snapped);
    } else setSelection(next);
  }, [product, selection]);

  const wa = product
    ? waLink(`Hi, I'd like a quote for ${product.name}${configLabel ? ` — ${configLabel}` : ""}.`)
    : waLink("");

  return (
    <AnimatePresence>
      <motion.div className={css.overlay} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className={css.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className={css.close} onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>

          {loading ? (
            <div className={css.loading}><div className={css.spinner} /></div>
          ) : !product ? (
            <div className={css.loading}><p>Could not load product.</p></div>
          ) : (
            <div className={css.body}>
              <div className={css.media}>
                {img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={img} alt={product.name} />
                ) : (
                  <div className={css.noImg}><span>TOS</span></div>
                )}
                {product.featured && <span className={css.feat}><Icon name="star" size={12} /> Featured</span>}
              </div>

              <div className={css.info}>
                <span className={css.cat}>{titleCase(product.category?.name) || "Uncategorized"}</span>
                <h3 className={css.title}>{titleCase(product.name)}</h3>

                <div className={css.priceRow}>
                  <span className={css.price}>{formatINR(active.price)}</span>
                  {!range.single && !activeVariant && <span className={css.from}>onwards</span>}
                  <span className={active.inStock ? css.in : css.out}>{active.inStock ? "In Stock" : "On Order"}</span>
                </div>

                {product.description && (
                  <p className={css.desc}>
                    {product.description.length > 180 ? product.description.slice(0, 180) + "…" : product.description}
                  </p>
                )}

                {attributes.map((attr) => {
                  const otherSel = { ...selection }; delete otherSel[attr.name];
                  return (
                    <div key={attr._id || attr.name} className={css.variants}>
                      <span className={css.vLabel}>{attr.name}: <b>{selection[attr.name] || "Select"}</b></span>
                      <div className={css.vGrid}>
                        {(attr.values || []).map((value) => {
                          const exists = valueExists(product, attr.name, value);
                          const avail = isValueAvailable(product, attr.name, value, otherSel);
                          const on = selection[attr.name] === value;
                          return (
                            <button
                              key={value}
                              className={`${css.vChip} ${on ? css.vOn : ""} ${exists && !avail ? css.vOut : ""}`}
                              onClick={() => exists && chooseValue(attr.name, value)}
                              disabled={!exists}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className={css.meta}>
                  <span><Icon name="box" size={15} /> Min. order {active.minOrderQuantity} {active.minOrderQuantity > 1 ? "units" : "unit"}</span>
                  {active.sku && <span><Icon name="tag" size={15} /> SKU {active.sku}</span>}
                </div>

                <div className={css.actions}>
                  <Link href={`/products/${product._id}`} className={`${css.btn} ${css.btnPrimary}`}>View Details <Icon name="arrow" size={16} /></Link>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={`${css.btn} ${css.btnWa}`}><Icon name="whatsapp" size={17} /> Quote</a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
