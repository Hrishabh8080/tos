"use client";
import { motion } from "framer-motion";

/**
 * Scroll-reveal wrapper. Fades + slides children in when they enter the
 * viewport. Respects prefers-reduced-motion via framer-motion defaults.
 *
 * <Reveal><h2>…</h2></Reveal>
 * <Reveal delay={0.1} y={30} as="section">…</Reveal>
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  className,
  as = "div",
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Stagger container — direct <Reveal.Item> children animate in sequence. */
export function Stagger({ children, className, gap = 0.08, as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, className, y = 22, as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </MotionTag>
  );
}
