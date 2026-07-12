import css from "./Home.module.css";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { SITE, waLink } from "@/lib/site";

export default function ContactCTA() {
  return (
    <section className={`${css.section} ${css.ctaBand}`} id="contact-us">
      <div className={css.inner}>
        <Reveal className={css.ctaCard}>
          <SectionHeading
            center
            eyebrow="Get In Touch"
            title="Let's power your next project"
            subtitle="Reach our corporate support team through any channel — we respond fast."
          />
          <div className={css.ctaChannels}>
            <a href={`tel:${SITE.phones[0]}`} className={css.ctaChannel}>
              <Icon name="phone" size={24} />
              <span><b>Call Us</b><span>{SITE.phones[0].replace("+91", "+91 ")}</span></span>
            </a>
            <a href={waLink("Hi Total Office Solutions, I'd like to discuss a requirement.")} target="_blank" rel="noopener noreferrer" className={css.ctaChannel}>
              <Icon name="whatsapp" size={24} />
              <span><b>WhatsApp</b><span>Quick quotes &amp; support</span></span>
            </a>
            <a href={`mailto:${SITE.email}`} className={css.ctaChannel}>
              <Icon name="mail" size={24} />
              <span><b>Email</b><span>{SITE.email}</span></span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
