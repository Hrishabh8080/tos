import css from "./Home.module.css";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { WHY_CHOOSE } from "@/lib/site";

export default function WhyChooseUs() {
  return (
    <section className={css.section} id="about">
      <div className={css.inner}>
        <SectionHeading
          center
          eyebrow="Why Choose Us"
          title="Built for enterprise-grade procurement"
          subtitle="We combine authorized-brand authenticity with wholesale economics and dependable logistics — so your business never slows down."
        />
        <Stagger className={css.whyGrid}>
          {WHY_CHOOSE.map((item) => (
            <StaggerItem key={item.title} className={css.whyCard}>
              <div className={css.whyIcon}><Icon name={item.icon} size={26} /></div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
