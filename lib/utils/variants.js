/**
 * Variant helpers — the single source of truth for the dynamic, multi-attribute
 * variant system (Size / Color / Packing / Voltage / … any attribute).
 *
 * Backward compatible:
 *  - Product with no variants  -> base price / stock / sku / minOrderQuantity.
 *  - Legacy variant with `size` (and no `options`) is read as a "Size" option.
 */

/* ----------------------------- parsing (server) ---------------------------- */

/** Parse + sanitize attribute definitions: [{ name, values:[String] }]. */
export function parseAttributes(raw) {
  const arr = coerceArray(raw);
  return arr
    .map((a) => {
      if (!a || typeof a !== "object") return null;
      const name = String(a.name ?? "").trim();
      if (!name) return null;
      const values = Array.isArray(a.values)
        ? [...new Set(a.values.map((v) => String(v).trim()).filter(Boolean))]
        : [];
      return { name: name.substring(0, 60), values: values.slice(0, 100) };
    })
    .filter(Boolean)
    .slice(0, 20);
}

/** Parse + sanitize variants: [{ options:[{name,value}], price, stock, sku, moq, image, status }]. */
export function parseVariants(raw) {
  const arr = coerceArray(raw);
  return arr
    .map((v) => {
      if (!v || typeof v !== "object") return null;
      const price = parseFloat(v.price);
      if (isNaN(price) || price < 0) return null;

      // options: array of {name,value}; tolerate legacy {size}
      let options = [];
      if (Array.isArray(v.options)) {
        options = v.options
          .map((o) => ({ name: String(o?.name ?? "").trim(), value: String(o?.value ?? "").trim() }))
          .filter((o) => o.name && o.value)
          .slice(0, 20);
      } else if (v.size) {
        options = [{ name: "Size", value: String(v.size).trim() }];
      }
      if (!options.length) return null; // a variant must define at least one option

      const stock = v.stock !== undefined ? parseInt(v.stock) : 0;
      const moq = v.minOrderQuantity !== undefined ? parseInt(v.minOrderQuantity) : 1;
      const out = {
        options,
        price,
        stock: isNaN(stock) || stock < 0 ? 0 : stock,
        minOrderQuantity: isNaN(moq) || moq < 1 ? 1 : moq,
        sku: v.sku ? String(v.sku).trim().substring(0, 60) : "",
        status: v.status === "out_of_stock" ? "out_of_stock" : "available",
      };
      const imgUrl = v.image?.url || v.imageUrl;
      if (imgUrl) {
        out.image = { url: String(imgUrl), publicId: String(v.image?.publicId || "") };
      }
      return out;
    })
    .filter(Boolean)
    .slice(0, 200);
}

function coerceArray(raw) {
  if (raw === undefined || raw === null || raw === "") return [];
  let arr = raw;
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { return []; }
  }
  return Array.isArray(arr) ? arr : [];
}

/* ------------------------------- accessors --------------------------------- */

export function getAttributes(product) {
  const a = product?.attributes;
  return Array.isArray(a) ? a.filter((x) => x && x.name) : [];
}

export function getVariants(product) {
  const v = product?.variants;
  return Array.isArray(v) ? v.filter((x) => x && (x.price !== undefined && x.price !== null)) : [];
}

export function hasVariants(product) {
  return getVariants(product).length > 0;
}

/** Normalized options for a variant (handles legacy `size`). */
export function variantOptions(variant) {
  if (Array.isArray(variant?.options) && variant.options.length) return variant.options;
  if (variant?.size) return [{ name: "Size", value: variant.size }];
  return [];
}

export function getOptionValue(variant, attrName) {
  return variantOptions(variant).find((o) => o.name === attrName)?.value ?? null;
}

export function isVariantInStock(variant) {
  return variant?.status !== "out_of_stock" && (Number(variant?.stock) || 0) > 0;
}

/* ------------------------------ selection logic ---------------------------- */

/** True when a variant matches every attribute/value in `selection`. */
export function variantMatchesSelection(variant, selection) {
  return Object.entries(selection || {}).every(([name, value]) => getOptionValue(variant, name) === value);
}

/** The variant that exactly matches the full selection (or null). */
export function findVariant(product, selection) {
  return getVariants(product).find((v) => variantMatchesSelection(v, selection)) || null;
}

/** First variant that has a given attribute value (used for fallback selection). */
export function firstVariantWithValue(product, attrName, value) {
  return getVariants(product).find((v) => getOptionValue(v, attrName) === value) || null;
}

/** Build the initial selection from the first in-stock variant (or first variant). */
export function getDefaultSelection(product) {
  const variants = getVariants(product);
  if (!variants.length) return {};
  const base = variants.find(isVariantInStock) || variants[0];
  const sel = {};
  getAttributes(product).forEach((attr) => {
    const val = getOptionValue(base, attr.name);
    if (val != null) sel[attr.name] = val;
  });
  // Fallback: if attributes weren't declared, derive from the variant's own options
  if (!Object.keys(sel).length) {
    variantOptions(base).forEach((o) => { sel[o.name] = o.value; });
  }
  return sel;
}

/**
 * Would choosing `value` for `attrName` (keeping the rest of `selection`) lead
 * to at least one in-stock variant? Powers Amazon-style option disabling.
 */
export function isValueAvailable(product, attrName, value, selection) {
  const probe = { ...selection, [attrName]: value };
  return getVariants(product).some((v) => variantMatchesSelection(v, probe) && isVariantInStock(v));
}

/** Does any variant at all use this value (in or out of stock)? */
export function valueExists(product, attrName, value) {
  return getVariants(product).some((v) => getOptionValue(v, attrName) === value);
}

/* ------------------------------- resolution -------------------------------- */

/** Normalized purchasable fields for the active variant (or base product). */
export function resolveActive(product, variant) {
  if (variant) {
    const inStock = isVariantInStock(variant);
    return {
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
      sku: variant.sku || "",
      minOrderQuantity: Number(variant.minOrderQuantity) || 1,
      image: variant.image?.url || null,
      status: variant.status || "available",
      inStock,
      options: variantOptions(variant),
    };
  }
  return {
    price: Number(product?.price) || 0,
    stock: Number(product?.stock) || 0,
    sku: product?.sku || "",
    minOrderQuantity: Number(product?.minOrderQuantity) || 1,
    image: null,
    status: (Number(product?.stock) || 0) > 0 ? "available" : "out_of_stock",
    inStock: (Number(product?.stock) || 0) > 0,
    options: [],
  };
}

/* -------------------------------- pricing ---------------------------------- */

export function getPriceRange(product) {
  const variants = getVariants(product);
  if (!variants.length) {
    const p = Number(product?.price) || 0;
    return { min: p, max: p, single: true };
  }
  const prices = variants.map((v) => Number(v.price) || 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, single: min === max };
}

export function formatINR(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

/** Card price label: "₹120" or "From ₹120". */
export function getDisplayPrice(product) {
  const { min, single } = getPriceRange(product);
  return single ? formatINR(min) : `From ${formatINR(min)}`;
}

/**
 * Compact option preview for listing cards.
 * Returns { name, shown:[values], extra:number } for the primary attribute,
 * e.g. { name:"Size", shown:["1 sq mm","1.5 sq mm"], extra:2 }.
 */
export function getOptionPreview(product, max = 2) {
  const attrs = getAttributes(product);
  let name, values;
  if (attrs.length) {
    name = attrs[0].name;
    values = attrs[0].values?.length
      ? attrs[0].values
      : [...new Set(getVariants(product).map((v) => getOptionValue(v, name)).filter(Boolean))];
  } else {
    // Derive from variants when attributes aren't declared
    const variants = getVariants(product);
    if (!variants.length) return null;
    name = variantOptions(variants[0])[0]?.name;
    if (!name) return null;
    values = [...new Set(variants.map((v) => getOptionValue(v, name)).filter(Boolean))];
  }
  if (!values || !values.length) return null;
  return { name, shown: values.slice(0, max), extra: Math.max(0, values.length - max) };
}
