"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import css from "./VariantSelector.module.css";

/**
 * One attribute's value picker — Amazon/Flipkart style.
 * Selected = filled; out-of-stock = greyed + diagonal strike; overflow shows ‹ › arrows.
 *
 * Props:
 *   name: string
 *   chosen: string | undefined
 *   values: [{ value, exists, available, selected }]
 *   onSelect(value)
 */
export default function VariantSelector({ name, chosen, values, onSelect }) {
  const trackRef = useRef(null);
  const [arrows, setArrows] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setArrows((a) => (a.left === left && a.right === right ? a : { left, right }));
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, values.length]);

  const scrollBy = (dir) => trackRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });

  return (
    <div className={css.group}>
      <div className={css.head}>
        <span className={css.name}>Select {name}</span>
        {chosen && <span className={css.chosen}>{chosen}</span>}
      </div>

      <div className={css.scroller}>
        <button
          type="button"
          className={`${css.arrow} ${css.arrowLeft} ${arrows.left ? css.arrowShow : ""}`}
          onClick={() => scrollBy(-1)}
          aria-label={`Scroll ${name} left`}
          tabIndex={arrows.left ? 0 : -1}
        >
          ‹
        </button>

        <div className={css.track} ref={trackRef} onScroll={update}>
          {values.map(({ value, exists, available, selected }) => (
            <button
              key={value}
              type="button"
              className={`${css.chip} ${selected ? css.selected : ""} ${exists && !available ? css.out : ""}`}
              onClick={() => exists && onSelect(value)}
              disabled={!exists}
              aria-pressed={selected}
              title={exists && !available ? `${value} — Out of stock` : value}
            >
              {value}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${css.arrow} ${css.arrowRight} ${arrows.right ? css.arrowShow : ""}`}
          onClick={() => scrollBy(1)}
          aria-label={`Scroll ${name} right`}
          tabIndex={arrows.right ? 0 : -1}
        >
          ›
        </button>
      </div>
    </div>
  );
}
