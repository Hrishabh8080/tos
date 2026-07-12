'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Icon from '@/components/ui/Icon';
import { SITE, BRANDS, waLink, buildBulkWa } from '@/lib/site';
import css from './BulkEnquiry.module.css';

const openWhatsApp = (url) => { try { window.open(url, '_blank', 'noopener'); } catch (e) {} };

const TIMELINES = ['Immediate (urgent)', 'Within a week', 'Within a month', 'Just exploring'];
const PERKS = [
  { icon: 'tag', title: 'Best Wholesale Pricing', desc: 'Direct-from-distributor rates with volume discounts.' },
  { icon: 'badge', title: 'GST-Compliant Invoicing', desc: 'Seamless input credit for enterprise procurement.' },
  { icon: 'truck', title: 'Fast Pan-India Delivery', desc: 'Reliable logistics for large project orders.' },
  { icon: 'headset', title: 'Dedicated Account Manager', desc: 'One point of contact from quote to delivery.' },
];

export default function BulkEnquiryPage() {
  const [form, setForm] = useState({
    company: '', gst: '', contactPerson: '', phone: '', email: '',
    city: '', state: '', brand: '', quantity: '', timeline: '', requirement: '',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const [sentWaUrl, setSentWaUrl] = useState('');
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setErrorMsg('File exceeds 10MB limit.'); return; }
    setErrorMsg('');
    setFile(f);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.contactPerson || !form.phone || !form.requirement) {
      setErrorMsg('Please fill in company, contact person, phone and requirement.');
      return;
    }
    setErrorMsg('');
    // Go straight to WhatsApp with the pre-filled enquiry — no API/email call.
    const waUrl = buildBulkWa({ ...form, fileName: file?.name });
    setSentWaUrl(waUrl);
    setStatus('sent');
    openWhatsApp(waUrl); // synchronous (direct user gesture) → not popup-blocked
  };

  if (status === 'sent') {
    return (
      <>
        <Header />
        <div className={css.successWrap}>
          <div className={css.successCard}>
            <div className={`${css.successIcon} ${css.pop}`}><Icon name="check" size={38} /></div>
            <h1>Enquiry Received!</h1>
            <p>Thank you, {form.contactPerson.split(' ')[0] || 'there'}. We&apos;ve emailed your requirement to our corporate desk. If WhatsApp didn&apos;t open automatically, tap below to send us your enquiry — you only need to press Send.</p>
            <div className={css.successActions}>
              <a href={sentWaUrl || waLink('Hi, I just submitted a bulk enquiry.')} target="_blank" rel="noopener noreferrer" className={`${css.btn} ${css.btnWa}`}>
                <Icon name="whatsapp" size={18} /> Chat on WhatsApp
              </a>
              <Link href="/products" className={`${css.btn} ${css.btnPrimary}`}>Browse Products <Icon name="arrow" size={17} /></Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <section className={css.hero}>
        <div className={css.heroGrid} />
        <div className={css.heroInner}>
          <nav className={css.crumb}><Link href="/">Home</Link><Icon name="chevron" size={13} /><span>Bulk Enquiry</span></nav>
          <span className={css.badge}><Icon name="box" size={15} /> Corporate & Wholesale Orders</span>
          <h1>Request a Bulk Quote</h1>
          <p>Share your requirement, product list or BOM — our corporate desk will respond with transparent, GST-compliant wholesale pricing.</p>
        </div>
      </section>

      <div className={css.layout}>
        {/* Info panel */}
        <aside className={css.info}>
          <h2>Why buy in bulk from us?</h2>
          <ul className={css.perks}>
            {PERKS.map((p) => (
              <li key={p.title}>
                <span className={css.perkIcon}><Icon name={p.icon} size={20} /></span>
                <div><b>{p.title}</b><span>{p.desc}</span></div>
              </li>
            ))}
          </ul>
          <div className={css.helpCard}>
            <p>Prefer to talk?</p>
            <a href={`tel:${SITE.phones[0]}`}><Icon name="phone" size={17} /> {SITE.phones[0]}</a>
            <a href={waLink('Hi, I have a bulk requirement.')} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={17} /> WhatsApp us</a>
          </div>
        </aside>

        {/* Form */}
        <form className={css.formCard} onSubmit={onSubmit} noValidate>
          <div className={css.grid}>
            <Field label="Company Name" required><input value={form.company} onChange={set('company')} placeholder="Your company / firm" /></Field>
            <Field label="GST Number"><input value={form.gst} onChange={set('gst')} placeholder="Optional" /></Field>
            <Field label="Contact Person" required><input value={form.contactPerson} onChange={set('contactPerson')} placeholder="Full name" /></Field>
            <Field label="Phone" required><input type="tel" value={form.phone} onChange={set('phone')} placeholder="Mobile / landline" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" /></Field>
            <Field label="City"><input value={form.city} onChange={set('city')} placeholder="City" /></Field>
            <Field label="State"><input value={form.state} onChange={set('state')} placeholder="State" /></Field>
            <Field label="Preferred Brand">
              <select value={form.brand} onChange={set('brand')}>
                <option value="">Any / No preference</option>
                {BRANDS.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Estimated Quantity"><input value={form.quantity} onChange={set('quantity')} placeholder="e.g. 500 units / 20 coils" /></Field>
            <Field label="Timeline">
              <select value={form.timeline} onChange={set('timeline')}>
                <option value="">Select timeline</option>
                {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Requirement Details" required full>
            <textarea rows={4} value={form.requirement} onChange={set('requirement')} placeholder="Describe the products, sizes, specifications and quantities you need…" />
          </Field>

          {/* File upload */}
          <div className={css.field}>
            <span className={css.label}>Upload Excel / BOM <em>(optional · max 10MB)</em></span>
            <div
              className={`${css.drop} ${dragOver ? css.dropOver : ''} ${file ? css.dropHasFile : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]); }}
            >
              {file ? (
                <div className={css.fileRow}>
                  <Icon name="box" size={20} />
                  <span className={css.fileName}>{file.name}</span>
                  <button type="button" className={css.fileRemove} onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Icon name="download" size={24} />
                  <p><b>Click to upload</b> or drag & drop</p>
                  <span>Excel, CSV or PDF</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          </div>

          {errorMsg && <p className={css.error}><Icon name="close" size={15} /> {errorMsg}</p>}

          <button type="submit" className={`${css.btn} ${css.btnWa} ${css.submit}`}>
            <Icon name="whatsapp" size={19} /> Send Enquiry on WhatsApp
          </button>
          <p className={css.note}>Opens WhatsApp with your enquiry pre-filled — just press Send. If you attached a BOM, please attach it in the chat.</p>
        </form>
      </div>
      <Footer />
    </>
  );
}

function Field({ label, children, required, full }) {
  return (
    <label className={`${css.field} ${full ? css.fieldFull : ''}`}>
      <span className={css.label}>{label} {required && <i className={css.req}>*</i>}</span>
      {children}
    </label>
  );
}
