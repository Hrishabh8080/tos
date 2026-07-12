import css from "./Home.module.css";
import SectionHeading from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { HOW_IT_WORKS } from "@/lib/site";

export default function HowItWorks() {
  return (
    <section className={css.section} style={{ background: "var(--bg-soft)" }}>
      <div className={css.inner}>
        <SectionHeading
          center
          eyebrow="How Ordering Works"
          title="From enquiry to delivery in four simple steps"
          subtitle="A streamlined, transparent process designed for busy procurement teams."
        />
        <Stagger className={css.howGrid} gap={0.12}>
          {HOW_IT_WORKS.map((s, i) => (
            <StaggerItem key={s.step} className={css.howStep}>
              {i < HOW_IT_WORKS.length - 1 && <span className={css.howConnector} />}
              <div className={css.stepNum}>{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
