import Link from "next/link";
import CSS from "./FooterStyle.module.css";
import { SITE, NAV, BRANDS, TRUST_BADGES, waLink } from "@/lib/site";
import Icon from "@/components/ui/Icon";

const Footer = () => {
  return (
    <footer className={CSS.footer}>
      {/* Trust strip */}
      <div className={CSS.trust}>
        <div className={CSS.trustInner}>
          {TRUST_BADGES.map((b) => (
            <span key={b} className={CSS.trustItem}>
              <Icon name="check" size={16} /> {b}
            </span>
          ))}
        </div>
      </div>

      <div className={CSS.main}>
        <div className={CSS.grid}>
          {/* Brand */}
          <div className={CSS.about}>
            <div className={CSS.brand}>
              <span className={CSS.logoMark}>TOS</span>
              <strong>Total Office Solutions</strong>
            </div>
            <p className={CSS.desc}>
              A trusted B2B wholesale partner supplying genuine electrical products,
              wires, cables, switchgear and office essentials to businesses across India —
              with bulk pricing, GST-compliant invoicing and fast delivery.
            </p>
            <div className={CSS.social}>
              <a href={waLink("Hi Total Office Solutions, I have an enquiry.")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={18} /></a>
              <a href={`tel:${SITE.phones[0]}`} aria-label="Call"><Icon name="phone" size={18} /></a>
              <a href={`mailto:${SITE.email}`} aria-label="Email"><Icon name="mail" size={18} /></a>
            </div>
          </div>

          {/* Quick links */}
          <div className={CSS.col}>
            <h4>Company</h4>
            <ul>
              {NAV.map((n) => (
                <li key={n.name}><Link href={n.path}>{n.name}</Link></li>
              ))}
              <li><Link href="/products">All Products</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div className={CSS.col}>
            <h4>Brands We Deal In</h4>
            <ul className={CSS.brandList}>
              {BRANDS.slice(0, 8).map((b) => (
                <li key={b.name}><Link href="/products">{b.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={CSS.col}>
            <h4>Get in Touch</h4>
            <ul className={CSS.contact}>
              <li>
                <Icon name="pin" size={18} />
                <span>{SITE.address.street}, {SITE.address.city}, {SITE.address.state}</span>
              </li>
              <li>
                <Icon name="phone" size={18} />
                <span>
                  {SITE.phones.map((p) => (
                    <a key={p} href={`tel:${p}`}>{p.replace("+91", "+91 ")}</a>
                  ))}
                </span>
              </li>
              <li>
                <Icon name="mail" size={18} />
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
            <Link href="/bulk-enquiry" className={CSS.cta}>
              Request a Quote <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className={CSS.bottom}>
        <div className={CSS.bottomInner}>
          <p>© {new Date().getFullYear()} Total Office Solutions. All rights reserved.</p>
          <p className={CSS.gst}>GSTIN: {SITE.gstin} · Authorized Wholesale Distributor</p>
        </div>
      </div>

      <div className={CSS.credit}>
        <p>
          Designed &amp; Developed by{" "}
          <a
            href="https://www.bytechalk.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            ByteChalk
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
