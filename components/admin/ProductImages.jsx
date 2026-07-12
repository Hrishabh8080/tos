"use client";
import { useEffect, useRef, useState } from "react";
import css from "./ProductImages.module.css";
import ImageCropper from "./ImageCropper";

/**
 * Shopify-style product image manager.
 *  - upload multiple (each opens the crop/optimize editor)
 *  - drag-and-drop reorder (first = cover); "Set as cover" for touch
 *  - delete / replace individual images; add more without replacing
 * Emits the ordered working set via onChange so the form can build the payload.
 *
 * item shape: { key, kind: 'existing'|'new', url, publicId?, blob? }
 */
export default function ProductImages({ initialImages = [], onChange }) {
  const counter = useRef(0);
  const [items, setItems] = useState([]);
  const [queue, setQueue] = useState([]);        // files waiting for the cropper (multi-add)
  const [replaceKey, setReplaceKey] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // (Re)initialize from existing images whenever the source changes (open/edit/reset)
  useEffect(() => {
    setItems(
      (initialImages || [])
        .filter((i) => i && i.url)
        .map((i) => ({ key: i.publicId || `ex-${counter.current++}`, kind: "existing", url: i.url, publicId: i.publicId }))
    );
  }, [initialImages]);

  useEffect(() => { onChange?.(items); }, [items, onChange]);

  const pushFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (files.length) setQueue((q) => [...q, ...files]);
  };

  const openReplace = (key) => { setReplaceKey(key); fileRef.current?.click(); };

  const onFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) { setReplaceKey(null); return; }
    if (replaceKey) setReplaceFile(files[0]);
    else pushFiles(files);
  };

  const onCropConfirm = (blob, previewUrl) => {
    const newItem = { key: `new-${counter.current++}`, kind: "new", url: previewUrl, blob };
    if (replaceKey) {
      setItems((prev) => prev.map((it) => (it.key === replaceKey ? newItem : it)));
      setReplaceKey(null); setReplaceFile(null);
    } else {
      setItems((prev) => [...prev, newItem]);
      setQueue((q) => q.slice(1));
    }
  };
  const onCropCancel = () => {
    if (replaceKey) { setReplaceKey(null); setReplaceFile(null); }
    else setQueue((q) => q.slice(1));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((it) => it.key !== key));
  const setCover = (key) => setItems((prev) => {
    const idx = prev.findIndex((it) => it.key === key);
    if (idx <= 0) return prev;
    const next = [...prev];
    const [moved] = next.splice(idx, 1);
    next.unshift(moved);
    return next;
  });

  const onDrop = (i) => {
    if (dragIndex === null || dragIndex === i) return setDragIndex(null);
    setItems((prev) => {
      const next = [...prev];
      const [m] = next.splice(dragIndex, 1);
      next.splice(i, 0, m);
      return next;
    });
    setDragIndex(null);
  };

  const cropFile = replaceFile || queue[0] || null;

  return (
    <div className={css.wrap}>
      <div className={css.headRow}>
        <label className={css.label}>Product Images</label>
        <span className={css.count}>{items.length} image{items.length !== 1 ? "s" : ""}</span>
      </div>

      {items.length > 0 && (
        <div className={css.grid}>
          {items.map((it, i) => (
            <div
              key={it.key}
              className={`${css.thumb} ${dragIndex === i ? css.dragging : ""} ${i === 0 ? css.coverThumb : ""}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onDragEnd={() => setDragIndex(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt="" />
              {i === 0 && <span className={css.coverBadge}>Cover</span>}
              <span className={css.dragHint} title="Drag to reorder">⠿</span>
              <div className={css.thumbActions}>
                {i !== 0 && <button type="button" title="Set as cover" onClick={() => setCover(it.key)}>★</button>}
                <button type="button" title="Replace" onClick={() => openReplace(it.key)}>⇄</button>
                <button type="button" title="Remove" className={css.del} onClick={() => removeItem(it.key)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`${css.drop} ${dragOver ? css.dropOver : ""}`}
        onClick={() => { setReplaceKey(null); fileRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); pushFiles(e.dataTransfer.files); }}
      >
        <div className={css.dropIcon}>⬆</div>
        <p><b>Click to upload</b> or drag &amp; drop</p>
        <span>Add multiple images — each opens the editor to crop &amp; optimize</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFileInput} />

      <div className={css.guide}>
        <b>Recommended:</b> 800×800px square · white or transparent background · JPG / PNG / WEBP · max 5 MB.
        Images are automatically cropped, resized &amp; compressed to optimized WEBP before upload.
      </div>

      {cropFile && (
        <ImageCropper file={cropFile} onCancel={onCropCancel} onConfirm={onCropConfirm} />
      )}
    </div>
  );
}
