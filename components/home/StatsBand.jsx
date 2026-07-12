"use client";
import css from "./Home.module.css";
import Counter from "@/components/ui/Counter";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { STATS } from "@/lib/site";

export default function StatsBand() {
  return (
    <section className={css.stats}>
      <Stagger className={css.statsGrid} gap={0.1}>
        {STATS.map((s) => (
          <StaggerItem key={s.label} className={css.statCard}>
            <div className={css.statValue}>
              <Counter to={s.value} />
              <span className={css.accent}>{s.suffix}</span>
            </div>
            <div className={css.statLabel}>{s.label}</div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
