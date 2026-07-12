import css from "./Home.module.css";
import { BRANDS } from "@/lib/site";

export default function Brands() {
  // Duplicate the list so the CSS marquee loops seamlessly (-50% translate).
  const loop = [...BRANDS, ...BRANDS];
  return (
    <section className={css.brands}>
      <p className={css.brandsLabel}>Authorized dealer &amp; supplier of India&apos;s leading brands</p>
      <div className={css.marquee}>
        <div className={css.marqueeTrack}>
          {loop.map((b, i) => (
            <div key={`${b.name}-${i}`} className={css.brandChip} title={b.name}>
              {b.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={`/brands/${b.logo}`} alt={b.name} loading="lazy" />
              ) : (
                b.name
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
