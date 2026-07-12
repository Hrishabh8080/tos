"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import CSS from "./HeaderStyle.module.css";
import { SITE, NAV, waLink } from "@/lib/site";
import Icon from "@/components/ui/Icon";

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track the URL hash so section links (e.g. /#about) highlight correctly
  useEffect(() => {
    const readHash = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (path) => {
    // Section link like "/#about" — active only on home with the matching hash
    if (path.startsWith("/#")) {
      return pathname === "/" && hash === `#${path.split("#")[1]}`;
    }
    // Home — active on "/" only when no section hash is present
    if (path === "/") return pathname === "/" && !hash;
    return pathname === path || pathname.startsWith(path + "/");
  };

  // Update active state immediately on click (hash links use pushState, which
  // doesn't reliably fire the hashchange event).
  const onNavClick = (path) => setHash(path.startsWith("/#") ? `#${path.split("#")[1]}` : "");

  return (
    <>
      {/* Utility bar */}
      <div className={CSS.utility}>
        <div className={CSS.utilityInner}>
          <div className={CSS.utilLeft}>
            <span className={CSS.utilBadge}><Icon name="badge" size={14} /> GST Verified Supplier</span>
            <span className={CSS.utilDot} />
            <span>Authorized Brands · 100% Genuine</span>
          </div>
          <div className={CSS.utilRight}>
            <a href={`tel:${SITE.phones[0]}`}><Icon name="phone" size={14} /> {SITE.phones[0]}</a>
            <a href={`mailto:${SITE.email}`}><Icon name="mail" size={14} /> {SITE.email}</a>
          </div>
        </div>
      </div>

      <header className={`${CSS.header} ${scrolled ? CSS.scrolled : ""}`}>
        <div className={CSS.inner}>
          <Link href="/" className={CSS.brand} onClick={() => setOpen(false)}>
            <span className={CSS.logoMark}>TOS</span>
            <span className={CSS.brandText}>
              <strong>Total Office Solutions</strong>
              <em>Wholesale Electrical Supplier</em>
            </span>
          </Link>

          <nav className={CSS.nav}>
            {NAV.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`${CSS.navItem} ${isActive(item.path) ? CSS.active : ""}`}
                onClick={() => onNavClick(item.path)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={CSS.actions}>
            <a
              href={waLink("Hi, I'd like a wholesale quote from Total Office Solutions.")}
              target="_blank"
              rel="noopener noreferrer"
              className={CSS.waBtn}
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" size={20} />
            </a>
            <Link href="/bulk-enquiry" className={CSS.cta}>
              Get Best Quote <Icon name="arrow" size={16} />
            </Link>
          </div>

          <button
            className={`${CSS.burger} ${open ? CSS.burgerOpen : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`${CSS.overlay} ${open ? CSS.overlayShow : ""}`} onClick={() => setOpen(false)} />
      <aside className={`${CSS.drawer} ${open ? CSS.drawerOpen : ""}`}>
        <div className={CSS.drawerHead}>
          <span className={CSS.logoMark}>TOS</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" size={22} /></button>
        </div>
        <nav className={CSS.drawerNav}>
          {NAV.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`${CSS.drawerLink} ${isActive(item.path) ? CSS.active : ""}`}
              onClick={() => { onNavClick(item.path); setOpen(false); }}
            >
              {item.name} <Icon name="arrow" size={16} />
            </Link>
          ))}
        </nav>
        <div className={CSS.drawerFoot}>
          <Link href="/bulk-enquiry" className={CSS.cta} onClick={() => setOpen(false)}>
            Get Best Quote <Icon name="arrow" size={16} />
          </Link>
          <a href={`tel:${SITE.phones[0]}`} className={CSS.drawerPhone}>
            <Icon name="phone" size={16} /> {SITE.phones[0]}
          </a>
        </div>
      </aside>
    </>
  );
};

export default Header;
