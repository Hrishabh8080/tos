"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import css from "./HScroll.module.css";

/**
 * Horizontal scroll row with ‹ › arrow buttons that appear only when the
 * content overflows — a clear "this is scrollable" affordance on web & mobile.
 * Also shows soft edge fades. Children are laid out inside the flex track.
 */
export default function HScroll({ children, className = "", by = 260 }) {
  const ref = useRef(null);
  const [arrows, setArrows] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setArrows((a) => (a.left === left && a.right === right ? a : { left, right }));
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * by, behavior: "smooth" });

  return (
    <div className={`${css.wrap} ${arrows.left ? css.fadeLeft : ""} ${arrows.right ? css.fadeRight : ""}`}>
      <button
        type="button"
        className={`${css.arrow} ${css.left} ${arrows.left ? css.show : ""}`}
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        tabIndex={arrows.left ? 0 : -1}
      >
        ‹
      </button>
      <div className={`${css.track} ${className}`} ref={ref} onScroll={update}>
        {children}
      </div>
      <button
        type="button"
        className={`${css.arrow} ${css.right} ${arrows.right ? css.show : ""}`}
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        tabIndex={arrows.right ? 0 : -1}
      >
        ›
      </button>
    </div>
  );
}
