"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import css from "./Home.module.css";
import Icon from "@/components/ui/Icon";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  return (
    <section className={css.hero}>
      <div className={css.heroGrid} />
      <div className={`${css.heroGlow} ${css.glowBlue}`} />
      <div className={`${css.heroGlow} ${css.glowOrange}`} />

      <div className={css.heroInner}>
        <div className={css.heroContent}>
          <motion.span className={css.heroChip} {...fade(0)}>
            <b>NEW</b> Bulk & Corporate Wholesale Pricing
          </motion.span>

          <motion.h1 className={css.heroTitle} {...fade(0.08)}>
            Trusted <span className={css.hl}>Electrical &amp; Office Supply</span> Partner for Businesses
          </motion.h1>

          <motion.p className={css.heroSub} {...fade(0.16)}>
            Genuine brands, wholesale rates and reliable pan-India delivery — the
            single-window procurement partner for enterprises, contractors and institutions.
          </motion.p>

          <motion.div className={css.heroPills} {...fade(0.22)}>
            {["Bulk Supply", "Corporate Orders", "Fast Delivery", "Genuine Brands"].map((p) => (
              <span key={p} className={css.heroPill}><Icon name="check" size={15} /> {p}</span>
            ))}
          </motion.div>

          <motion.div className={css.heroCtas} {...fade(0.3)}>
            <Link href="/bulk-enquiry" className="tos-hero-cta">
              <PulseButton>Get Best Quote</PulseButton>
            </Link>
            <Link href="/products" className={css.viewAll} style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}>
              Browse Products <Icon name="arrow" size={16} />
            </Link>
          </motion.div>

          <motion.div className={css.heroTrust} {...fade(0.4)}>
            <div className={css.heroTrustItem}><b>9+</b><span>Years of Trust</span></div>
            <div className={css.heroTrustDivider} />
            <div className={css.heroTrustItem}><b>12k+</b><span>Products Supplied</span></div>
            <div className={css.heroTrustDivider} />
            <div className={css.heroTrustItem}><b>3.5k+</b><span>Business Clients</span></div>
          </motion.div>
        </div>

        {/* Glass spec card */}
        <motion.div
          className={css.heroVisual}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={css.glassCard}>
            <div className={css.glassHead}>
              <span>Featured · Wires &amp; Cables</span>
              <span className={css.glassBadge}>In Stock</span>
            </div>
            <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: 16 }}>Polycab FR Wire</h3>
            <div className={css.glassRow}><span>Size</span><span>1.5 sq mm</span></div>
            <div className={css.glassRow}><span>Rating</span><span>1100V · FR</span></div>
            <div className={css.glassRow}><span>Pack</span><span>90m Coil</span></div>
            <div className={css.glassRow}><span>Min. Order</span><span>10 Coils</span></div>
            <div className={css.glassPrice}>
              <b>₹1,240</b><em>/ coil · bulk rates on quote</em>
            </div>

            <motion.div
              className={`${css.floatTag} ${css.floatTop}`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name="badge" size={16} /> 100% Genuine
            </motion.div>
            <motion.div
              className={`${css.floatTag} ${css.floatBottom}`}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name="truck" size={16} /> Pan-India Delivery
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Animated primary CTA with a moving sheen. */
function PulseButton({ children }) {
  return (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "1rem",
        color: "#fff",
        padding: "15px 28px",
        borderRadius: "999px",
        background: "var(--grad-accent)",
        boxShadow: "var(--sh-accent)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
      <Icon name="arrow" size={18} />
      <motion.span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)",
          filter: "blur(2px)",
        }}
        animate={{ left: ["-30%", "130%"] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
      />
    </motion.span>
  );
}
