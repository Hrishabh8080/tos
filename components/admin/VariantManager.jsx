"use client";
import { useState } from "react";
import css from "./VariantManager.module.css";

/**
 * Dynamic variant manager for the admin product form. Simple but complete:
 *  - add / edit / delete attributes (any name), add / remove values
 *  - generate variant rows (cartesian) and edit price / stock / SKU / min qty / status / image
 *  - duplicate a variant row, drag to reorder, or copy variants from another product
 * Fully dynamic (no hardcoded attribute names). Leave empty for a single-price product.
 *
 * Props:
 *   attributes, variants, onChange({attributes, variants})
 *   sourceProducts: [{_id, name, attributes, variants}]  // for "copy from"
 */
export default function VariantManager({ attributes = [], variants = [], onChange, sourceProducts = [] }) {
  const [valueDrafts, setValueDrafts] = useState({});
  const [dragIndex, setDragIndex] = useState(null);

  const emit = (next) => onChange({ attributes, variants, ...next });

  /* -------- rows: build combinations, preserving existing values by signature -------- */
  const sig = (options) => options.map((o) => `${o.name}:${o.value}`).sort().join("|");
  const buildRows = (attrs, existing) => {
    const usable = attrs.filter((a) => a.name && a.values?.length);
    if (!usable.length) return [];
    let combos = [[]];
    usable.forEach((attr) => {
      const next = [];
      combos.forEach((combo) => attr.values.forEach((value) => next.push([...combo, { name: attr.name, value }])));
      combos = next;
    });
    const bySig = new Map((existing || []).map((v) => [sig(v.options), v]));
    return combos.slice(0, 200).map((options) => {
      const ex = bySig.get(sig(options));
      return ex ? { ...ex, options } : { options, price: "", stock: 0, sku: "", minOrderQuantity: 1, status: "available", imageUrl: "" };
    });
  };

  /* -------- attributes (rows auto-regenerate on change) -------- */
  const addAttribute = () => emit({ attributes: [...attributes, { name: "", values: [] }] });

  const updateAttrName = (i, name) => {
    const oldName = attributes[i].name;
    const nextAttrs = attributes.map((a, idx) => (idx === i ? { ...a, name } : a));
    // rename the option in existing rows so their price/stock are preserved
    const nextVariants = variants.map((v) => ({ ...v, options: v.options.map((o) => (o.name === oldName ? { ...o, name } : o)) }));
    emit({ attributes: nextAttrs, variants: nextVariants });
  };

  const removeAttribute = (i) => {
    const removed = attributes[i];
    const nextAttrs = attributes.filter((_, idx) => idx !== i);
    const stripped = variants.map((v) => ({ ...v, options: v.options.filter((o) => o.name !== removed.name) }));
    emit({ attributes: nextAttrs, variants: buildRows(nextAttrs, stripped) });
  };

  const addValue = (i) => {
    const draft = (valueDrafts[i] || "").trim();
    if (!draft) return;
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    const nextAttrs = attributes.map((a, idx) => (idx === i ? { ...a, values: [...new Set([...(a.values || []), ...parts])] } : a));
    setValueDrafts((d) => ({ ...d, [i]: "" }));
    emit({ attributes: nextAttrs, variants: buildRows(nextAttrs, variants) });
  };

  const removeValue = (i, value) => {
    const nextAttrs = attributes.map((a, idx) => (idx === i ? { ...a, values: a.values.filter((v) => v !== value) } : a));
    emit({ attributes: nextAttrs, variants: buildRows(nextAttrs, variants) });
  };

  const generateRows = () => emit({ variants: buildRows(attributes, variants) });

  const updateVariant = (i, field, value) => emit({ variants: variants.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)) });
  const removeVariant = (i) => emit({ variants: variants.filter((_, idx) => idx !== i) });
  const duplicateVariant = (i) => {
    const clone = { ...variants[i], options: variants[i].options.map((o) => ({ ...o })), sku: "" };
    emit({ variants: [...variants.slice(0, i + 1), clone, ...variants.slice(i + 1)] });
  };

  /* -------- drag reorder -------- */
  const onDrop = (i) => {
    if (dragIndex === null || dragIndex === i) return setDragIndex(null);
    const next = [...variants];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setDragIndex(null);
    emit({ variants: next });
  };

  /* -------- copy from another product -------- */
  const copyFrom = (id) => {
    const src = sourceProducts.find((p) => String(p._id) === String(id));
    if (!src) return;
    const srcAttrs = (src.attributes || []).map((a) => ({ name: a.name, values: [...(a.values || [])] }));
    const srcVars = (src.variants || []).map((v) => ({
      options: (Array.isArray(v.options) && v.options.length ? v.options : (v.size ? [{ name: "Size", value: v.size }] : [])).map((o) => ({ name: o.name, value: o.value })),
      price: v.price ?? "", stock: v.stock ?? 0, sku: v.sku || "", minOrderQuantity: v.minOrderQuantity || 1,
      status: v.status || "available", imageUrl: v.image?.url || "",
    }));
    onChange({ attributes: srcAttrs, variants: srcVars });
  };

  const canGenerate = attributes.some((a) => a.name && a.values?.length);
  const copySources = sourceProducts.filter((p) => Array.isArray(p.variants) && p.variants.length);

  return (
    <div className={css.wrap}>
      <div className={css.head}>
        <div>
          <h4>Product Variants <span className={css.optional}>optional</span></h4>
          <p>Add an attribute (e.g. Size), then add its values — the price / stock rows appear automatically below. Leave empty for a single-price product.</p>
        </div>
        {copySources.length > 0 && (
          <select className={css.copySelect} defaultValue="" onChange={(e) => { if (e.target.value) copyFrom(e.target.value); e.target.value = ""; }}>
            <option value="">Copy variants from…</option>
            {copySources.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Attributes */}
      <div className={css.attrs}>
        {attributes.map((attr, i) => (
          <div key={i} className={css.attr}>
            <div className={css.attrTop}>
              <input className={css.attrName} placeholder="Attribute name (e.g. Size)" value={attr.name} onChange={(e) => updateAttrName(i, e.target.value)} />
              <button type="button" className={css.removeAttr} onClick={() => removeAttribute(i)} title="Remove attribute">✕</button>
            </div>
            <div className={css.values}>
              {(attr.values || []).map((v) => (
                <span key={v} className={css.chip}>{v}<button type="button" onClick={() => removeValue(i, v)} aria-label={`Remove ${v}`}>✕</button></span>
              ))}
              <span className={css.valueAdd}>
                <input
                  className={css.valueInput}
                  placeholder="Type a value…"
                  value={valueDrafts[i] || ""}
                  onChange={(e) => setValueDrafts((d) => ({ ...d, [i]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addValue(i); } }}
                />
                <button type="button" className={css.valueAddBtn} onClick={() => addValue(i)}>Add</button>
              </span>
            </div>
          </div>
        ))}
        <button type="button" className={css.addAttr} onClick={addAttribute}>+ Add Attribute</button>
      </div>

      {canGenerate && variants.length > 0 && (
        <button type="button" className={css.generate} onClick={generateRows}>⟳ Refresh Variant Rows</button>
      )}

      {/* Variant rows */}
      {variants.length > 0 && (
        <div className={css.rowsScroll}>
          <div className={css.rows}>
            <div className={`${css.row} ${css.rowHead}`}>
              <span className={css.colDrag} />
              <span className={css.colOpt}>Variant</span>
              <span>Price ₹</span><span>Stock</span><span>SKU</span><span>Min Qty</span><span>Status</span><span>Image URL</span><span />
            </div>
            {variants.map((v, i) => (
              <div
                key={i}
                className={`${css.row} ${dragIndex === i ? css.dragging : ""}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                onDragEnd={() => setDragIndex(null)}
              >
                <span className={css.colDrag} title="Drag to reorder">⠿</span>
                <span className={css.colOpt}>{v.options.map((o) => <span key={o.name} className={css.optTag}>{o.value}</span>)}</span>
                <input type="number" min="0" step="0.01" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="0" />
                <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} placeholder="0" />
                <input type="text" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="SKU" />
                <input type="number" min="1" value={v.minOrderQuantity} onChange={(e) => updateVariant(i, "minOrderQuantity", e.target.value)} placeholder="1" />
                <select value={v.status} onChange={(e) => updateVariant(i, "status", e.target.value)}>
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
                <input type="url" value={v.imageUrl || ""} onChange={(e) => updateVariant(i, "imageUrl", e.target.value)} placeholder="https://… (optional)" />
                <span className={css.rowActions}>
                  <button type="button" className={css.dupRow} onClick={() => duplicateVariant(i)} title="Duplicate">⧉</button>
                  <button type="button" className={css.removeRow} onClick={() => removeVariant(i)} title="Remove">✕</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
