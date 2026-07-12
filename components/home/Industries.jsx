import css from "./Home.module.css";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { INDUSTRIES } from "@/lib/site";

export default function Industries() {
  return (
    <section className={`${css.section} ${css.industries}`}>
      <div className={css.heroGrid} />
      <div className={css.inner}>
        <SectionHeading
          center
          light
          eyebrow="Industries We Serve"
          title="Trusted across every sector"
          subtitle="From factory floors to corporate towers, we power procurement for businesses of every scale."
        />
        <Stagger className={css.indGrid}>
          {INDUSTRIES.map((ind) => (
            <StaggerItem key={ind.name} className={css.indCard}>
              <span className={css.indIcon}><Icon name={ind.icon} size={22} /></span>
              <span>{ind.name}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
