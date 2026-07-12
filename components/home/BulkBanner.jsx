import Link from "next/link";
import css from "./Home.module.css";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { SITE, waLink } from "@/lib/site";

export default function BulkBanner() {
  return (
    <section className={css.bulk}>
      <Reveal className={css.bulkInner}>
        <div className={css.bulkGlow} />
        <div className={css.bulkText}>
          <h2>Have a bulk requirement or a BOM to price?</h2>
          <p>Share your product list or Excel/BOM and get a transparent, GST-compliant wholesale quotation from our corporate desk — usually within hours.</p>
        </div>
        <div className={css.bulkActions}>
          <Link href="/bulk-enquiry" className={css.viewAll} style={{ background: "var(--grad-accent)", color: "#fff", border: "none", boxShadow: "var(--sh-accent)" }}>
            Submit Bulk Enquiry <Icon name="arrow" size={16} />
          </Link>
          <a
            href={waLink("Hi, I have a bulk requirement and would like a quote.")}
            target="_blank"
            rel="noopener noreferrer"
            className={css.viewAll}
            style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
          >
            <Icon name="whatsapp" size={18} /> WhatsApp Us
          </a>
        </div>
      </Reveal>
    </section>
  );
}
