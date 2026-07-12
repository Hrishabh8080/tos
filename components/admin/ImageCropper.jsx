"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import css from "./ImageCropper.module.css";

/**
 * In-browser square crop editor. The crop frame is FIXED; the image moves/zooms
 * inside it (drag, mouse-wheel, touch pinch). On confirm it renders an optimized
 * square image (default 800×800, WEBP, compressed) — only the optimized output is
 * ever uploaded. Fully self-contained (no external cropper dependency).
 *
 * Props: file (File) | src (string), onCancel(), onConfirm(Blob, previewUrl)
 */
const TARGET = 800;   // output px (square)
const MAX_ZOOM = 5;
const QUALITY = 0.85;

export default function ImageCropper({ file, src, onCancel, onConfirm }) {
  const frameRef = useRef(null);
  const imgElRef = useRef(null);
  const pointers = useRef(new Map());
  const pan = useRef({ active: false, lastX: 0, lastY: 0 });
  const pinch = useRef({ dist: 0, zoom: 1 });

  const [url, setUrl] = useState(src || null);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [V, setV] = useState(320);          // measured frame size (px)
  const [zoom, setZoom] = useState(1);       // 1 = cover
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  // Load file → object URL
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  // Measure frame
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setV(el.getBoundingClientRect().width || 320);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseScale = nat.w && nat.h ? V / Math.min(nat.w, nat.h) : 1; // cover fit
  const displayScale = baseScale * zoom;

  const clampOffset = useCallback((off, z = zoom) => {
    const ds = baseScale * z;
    const maxX = Math.max(0, (nat.w * ds - V) / 2);
    const maxY = Math.max(0, (nat.h * ds - V) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, off.x)), y: Math.max(-maxY, Math.min(maxY, off.y)) };
  }, [baseScale, nat.w, nat.h, V, zoom]);

  const onImgLoad = (e) => {
    const img = e.currentTarget;
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const applyZoom = useCallback((nextZoom) => {
    const z = Math.max(1, Math.min(MAX_ZOOM, nextZoom));
    setZoom(z);
    setOffset((o) => clampOffset(o, z));
  }, [clampOffset]);

  // Pointer (mouse + touch) pan & pinch
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      pan.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      pan.current.active = false;
    }
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.dist > 0) applyZoom(pinch.current.zoom * (d / pinch.current.dist));
    } else if (pan.current.active) {
      const dx = e.clientX - pan.current.lastX;
      const dy = e.clientY - pan.current.lastY;
      pan.current.lastX = e.clientX;
      pan.current.lastY = e.clientY;
      setOffset((o) => clampOffset({ x: o.x + dx, y: o.y + dy }));
    }
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current.dist = 0;
    if (pointers.current.size === 0) pan.current.active = false;
    else {
      const first = [...pointers.current.values()][0];
      pan.current = { active: true, lastX: first.x, lastY: first.y };
    }
  };
  const onWheel = (e) => {
    e.preventDefault();
    applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.92));
  };

  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  // Transform for a preview box of size B (frame uses B = V)
  const styleFor = (B) => {
    const r = B / V;
    return {
      width: nat.w * displayScale * r,
      height: nat.h * displayScale * r,
      transform: `translate(calc(-50% + ${offset.x * r}px), calc(-50% + ${offset.y * r}px))`,
    };
  };

  const confirm = async () => {
    if (!imgElRef.current || !nat.w) return;
    setBusy(true);
    try {
      const ds = displayScale;
      const imgLeft = V / 2 + offset.x - (nat.w * ds) / 2;
      const imgTop = V / 2 + offset.y - (nat.h * ds) / 2;
      const sx = (0 - imgLeft) / ds;
      const sy = (0 - imgTop) / ds;
      const sSize = V / ds;

      const canvas = document.createElement("canvas");
      canvas.width = TARGET;
      canvas.height = TARGET;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgElRef.current, sx, sy, sSize, sSize, 0, 0, TARGET, TARGET);

      let blob = await new Promise((res) => canvas.toBlob(res, "image/webp", QUALITY));
      if (!blob) blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", QUALITY)); // fallback
      if (!blob) return;
      const preview = URL.createObjectURL(blob);
      onConfirm(blob, preview);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={css.overlay} onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={css.modal}>
        <div className={css.head}>
          <h3>Adjust image</h3>
          <button className={css.close} onClick={onCancel} aria-label="Cancel">✕</button>
        </div>

        <div className={css.body}>
          <div
            className={css.frame}
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            {url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={imgElRef}
                src={url}
                alt="Crop preview"
                className={css.img}
                style={styleFor(V)}
                onLoad={onImgLoad}
                draggable={false}
                crossOrigin="anonymous"
              />
            )}
            <div className={css.grid} aria-hidden />
          </div>

          <div className={css.side}>
            <span className={css.previewLabel}>Live preview</span>
            <div className={css.previews}>
              {[{ b: 132, l: "Detail" }, { b: 92, l: "Card" }, { b: 56, l: "Thumb" }].map(({ b, l }) => (
                <div key={l} className={css.previewItem}>
                  <div className={css.previewBox} style={{ width: b, height: b }}>
                    {url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={url} alt="" className={css.img} style={styleFor(b)} draggable={false} />
                    )}
                  </div>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={css.controls}>
          <button className={css.zoomBtn} onClick={() => applyZoom(zoom - 0.25)} aria-label="Zoom out">−</button>
          <input
            type="range" min="1" max={MAX_ZOOM} step="0.01" value={zoom}
            onChange={(e) => applyZoom(parseFloat(e.target.value))}
            className={css.slider} aria-label="Zoom"
          />
          <button className={css.zoomBtn} onClick={() => applyZoom(zoom + 0.25)} aria-label="Zoom in">+</button>
          <button className={css.reset} onClick={reset}>Reset</button>
        </div>

        <p className={css.hint}>Drag to reposition · scroll / pinch to zoom · exported as optimized 800×800 WEBP</p>

        <div className={css.actions}>
          <button className={css.cancel} onClick={onCancel}>Cancel</button>
          <button className={css.confirm} onClick={confirm} disabled={busy || !nat.w}>
            {busy ? "Processing…" : "Use image"}
          </button>
        </div>
      </div>
    </div>
  );
}
