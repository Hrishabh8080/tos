import css from "./SectionHeading.module.css";
import Reveal from "./Reveal";

/**
 * Consistent section header — eyebrow + title + optional subtitle.
 * <SectionHeading eyebrow="Why Choose Us" title="…" subtitle="…" center />
 */
export default function SectionHeading({ eyebrow, title, subtitle, center, light }) {
  return (
    <Reveal className={`${css.wrap} ${center ? css.center : ""} ${light ? css.light : ""}`}>
      {eyebrow && (
        <span className={css.eyebrow}>
          <span className={css.dot} />
          {eyebrow}
        </span>
      )}
      {title && <h2 className={css.title}>{title}</h2>}
      {subtitle && <p className={css.subtitle}>{subtitle}</p>}
    </Reveal>
  );
}
