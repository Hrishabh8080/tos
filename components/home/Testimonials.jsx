import css from "./Home.module.css";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import { TESTIMONIALS } from "@/lib/site";

export default function Testimonials() {
  return (
    <section className={css.section} id="testimonial">
      <div className={css.inner}>
        <SectionHeading
          center
          eyebrow="Customer Testimonials"
          title="Why businesses trust Total Office Solutions"
          subtitle="Real feedback from procurement heads, facility managers and contractors we supply."
        />
        <Stagger className={css.tstGrid}>
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name} className={css.tstCard}>
              <Icon name="quote" size={34} className={css.quoteMark} />
              <div className={css.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={16} />
                ))}
              </div>
              <p className={css.tstQuote}>{t.quote}</p>
              <div className={css.tstUser}>
                <SmartImage src={`/avatars/${t.avatar}`} alt={t.name} width={48} height={48} sizes="48px" wrapClassName={css.tstAvatar} />
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
