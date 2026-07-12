'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Icon from '@/components/ui/Icon';
import { SITE, waLink, buildContactWa } from '@/lib/site';
import css from './Contact.module.css';

const openWhatsApp = (url) => { try { window.open(url, '_blank', 'noopener'); } catch (e) {} };

const fullAddress = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.state}, ${SITE.address.country}`;
// Center the map on the exact office coordinates (drops a pin there)
const mapSrc = `https://maps.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&z=16&output=embed`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${SITE.geo.lat},${SITE.geo.lng}`;

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [sentWaUrl, setSentWaUrl] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) { setErr('Please fill in your name, phone and message.'); return; }
    setErr('');
    // Go straight to WhatsApp with the pre-filled message — no API/email call.
    const waUrl = buildContactWa({ name: form.name, phone: form.phone, email: form.email, message: form.message });
    setSentWaUrl(waUrl);
    setStatus('sent');
    openWhatsApp(waUrl);
  };

  const channels = [
    { icon: 'phone', title: 'Call Us', lines: SITE.phones, href: `tel:${SITE.phones[0]}`, hrefs: SITE.phones.map((p) => `tel:${p}`) },
    { icon: 'whatsapp', title: 'WhatsApp', lines: ['Quick quotes & support'], href: waLink('Hi Total Office Solutions, I have an enquiry.'), ext: true },
    { icon: 'mail', title: 'Email', lines: [SITE.email], href: `mailto:${SITE.email}` },
  ];

  return (
    <>
      <Header />
      <section className={css.hero}>
        <div className={css.heroGrid} />
        <div className={css.heroInner}>
          <nav className={css.crumb}><Link href="/">Home</Link><Icon name="chevron" size={13} /><span>Contact</span></nav>
          <h1>Get in Touch</h1>
          <p>Questions, quotes or corporate orders — our team is here to help. Reach us through any channel below.</p>
        </div>
      </section>

      {/* Channels */}
      <div className={css.channels}>
        {channels.map((c) => (
          <a key={c.title} href={c.href} target={c.ext ? '_blank' : undefined} rel={c.ext ? 'noopener noreferrer' : undefined} className={css.channel}>
            <span className={css.channelIcon}><Icon name={c.icon} size={24} /></span>
            <div>
              <b>{c.title}</b>
              {c.lines.map((l) => <span key={l}>{l}</span>)}
            </div>
            <Icon name="arrow" size={18} className={css.channelArrow} />
          </a>
        ))}
      </div>

      <div className={css.layout}>
        {/* Left: info + hours + map */}
        <div className={css.infoCol}>
          <div className={css.infoCard}>
            <h2>Visit our office</h2>
            <ul className={css.detailList}>
              <li><span className={css.di}><Icon name="pin" size={18} /></span><div><b>Address</b><span>{fullAddress}</span></div></li>
              <li><span className={css.di}><Icon name="phone" size={18} /></span><div><b>Phone</b><span>{SITE.phones.map((p) => <a key={p} href={`tel:${p}`}>{p}</a>)}</span></div></li>
              <li><span className={css.di}><Icon name="mail" size={18} /></span><div><b>Email</b><span><a href={`mailto:${SITE.email}`}>{SITE.email}</a></span></div></li>
              <li><span className={css.di}><Icon name="badge" size={18} /></span><div><b>GSTIN</b><span>{SITE.gstin}</span></div></li>
            </ul>
            <div className={css.hours}>
              <b><Icon name="clock" size={17} /> Business Hours</b>
              {SITE.hours.map((h) => (
                <div key={h.day} className={css.hourRow}><span>{h.day}</span><span>{h.time}</span></div>
              ))}
            </div>
          </div>
          <div className={css.map}>
            <iframe src={mapSrc} title="Office location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <a href={mapLink} target="_blank" rel="noopener noreferrer" className={css.directions}>
              <Icon name="pin" size={16} /> Get Directions
            </a>
          </div>
        </div>

        {/* Right: form */}
        <div className={css.formCard}>
          {status === 'sent' ? (
            <div className={css.sent}>
              <div className={`${css.sentIcon} ${css.pop}`}><Icon name="check" size={34} /></div>
              <h3>Message sent!</h3>
              <p>Thanks for reaching out — we&apos;ve emailed your message. If WhatsApp didn&apos;t open automatically, tap below and just press Send.</p>
              <a href={sentWaUrl || waLink('Hi, I just sent a message via your website.')} target="_blank" rel="noopener noreferrer" className={`${css.btn} ${css.btnWa}`}><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <h2>Send us a message</h2>
              <p className={css.formSub}>We typically respond within a few business hours.</p>
              <label className={css.field}><span>Your Name <i>*</i></span><input value={form.name} onChange={set('name')} placeholder="Full name" /></label>
              <div className={css.row}>
                <label className={css.field}><span>Phone <i>*</i></span><input type="tel" value={form.phone} onChange={set('phone')} placeholder="Mobile number" /></label>
                <label className={css.field}><span>Email</span><input type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" /></label>
              </div>
              <label className={css.field}><span>Message <i>*</i></span><textarea rows={5} value={form.message} onChange={set('message')} placeholder="How can we help you?" /></label>
              {err && <p className={css.err}><Icon name="close" size={15} /> {err}</p>}
              <button type="submit" className={`${css.btn} ${css.btnWa} ${css.submit}`}>
                <Icon name="whatsapp" size={19} /> Send on WhatsApp
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
