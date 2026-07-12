"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

/**
 * Count-up number that animates once when scrolled into view.
 * <Counter to={12000} suffix="+" />  ->  0 … 12,000+
 */
export default function Counter({ to = 0, duration = 2, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
