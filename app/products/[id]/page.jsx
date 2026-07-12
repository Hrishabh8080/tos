'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Icon from '@/components/ui/Icon';
import ProductCard from '@/components/ui/ProductCard';
import SmartImage from '@/components/ui/SmartImage';
import VariantSelector from '@/components/products/VariantSelector';
import { deduplicatedFetch } from '@/lib/utils/fetchCache';
import {
  getAttributes, getVariants, getDefaultSelection, findVariant,
  firstVariantWithValue, getOptionValue, valueExists, isValueAvailable, resolveActive,
  getPriceRange, formatINR,
} from '@/lib/utils/variants';
import { SITE, BRANDS, waLink, buildProductWa } from '@/lib/site';
import { titleCase } from '@/lib/utils/format';
import styles from './ProductDetail.module.css';

const openWhatsApp = (url) => { try { window.open(url, '_blank', 'noopener'); } catch (e) {} };

const TABS = ['Description', 'Specifications', 'Applications', 'Shipping'];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contact/quote (preserved logic)
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [sentWaUrl, setSentWaUrl] = useState('');

  // UI state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selection, setSelection] = useState({}); // { attrName: value }
  const [activeTab, setActiveTab] = useState('Description');
  const [wishlisted, setWishlisted] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const zoomRef = useRef(null);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('tos_customer_name');
      const savedMobile = localStorage.getItem('tos_customer_mobile');
      if (savedName) setCustomerName(savedName);
      if (savedMobile) setMobileNumber(savedMobile);
    } catch (e) {}
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);
    try { localStorage.setItem('tos_customer_name', value); } catch (e) {}
  };
  const handleMobileChange = (e) => {
    const value = e.target.value;
    setMobileNumber(value);
    try { localStorage.setItem('tos_customer_mobile', value); } catch (e) {}
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProduct();
    fetchRelatedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    setSelection(getDefaultSelection(product));
    setSelectedImageIndex(0);
    setActiveTab('Description');
    setRequestSent(false);
    try {
      const list = JSON.parse(localStorage.getItem('tos_wishlist') || '[]');
      setWishlisted(Array.isArray(list) && list.includes(String(product._id)));
    } catch (e) {}
  }, [product]);

  const fetchProduct = async (forceRefresh = false) => {
    try {
      if (!params || !params.id) { router.push('/products'); return; }
      setLoading(true);
      const CACHE_KEY = `tos_product_${params.id}_cache`;
      const CACHE_DURATION = 5 * 60 * 1000;
      if (!forceRefresh) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (data && timestamp && Date.now() - timestamp < CACHE_DURATION) {
              setProduct(data); setLoading(false);
              window.scrollTo({ top: 0, behavior: 'smooth' }); return;
            }
          }
        } catch (e) {}
      }
      const response = await deduplicatedFetch(`/api/products/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) { router.push('/products'); return; }
        throw new Error('Failed to fetch product');
      }
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Invalid response');
      const data = await response.clone().json();
      setProduct(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() })); } catch (e) {}
    } catch (error) {
      try {
        const cached = sessionStorage.getItem(`tos_product_${params.id}_cache`);
        if (cached) { const parsed = JSON.parse(cached); if (parsed?.data) { setProduct(parsed.data); setLoading(false); return; } }
      } catch (e) {}
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = useCallback(async (forceRefresh = false) => {
    if (!params?.id) return;
    try {
      const CACHE_KEY = `tos_related_${params.id}_cache`;
      const CACHE_DURATION = 5 * 60 * 1000;
      if (!forceRefresh) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.data && parsed?.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
              setRelatedProducts(parsed.data.relatedProducts || []);
              setOtherProducts(parsed.data.otherProducts || []); return;
            }
          }
        } catch (e) {}
      }
      const response = await deduplicatedFetch(`/api/products/${params.id}/related`);
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        const related = Array.isArray(data.relatedProducts) ? data.relatedProducts : [];
        const other = Array.isArray(data.otherProducts) ? data.otherProducts : [];
        setRelatedProducts(related); setOtherProducts(other);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: { relatedProducts: related, otherProducts: other }, timestamp: Date.now() })); } catch (e) {}
      }
    } catch (error) { setRelatedProducts([]); setOtherProducts([]); }
  }, [params.id]);

  // ---- Derived (variant-aware) ----
  const attributes = useMemo(() => getAttributes(product), [product]);
  const variants = useMemo(() => getVariants(product), [product]);
  const hasVariants = variants.length > 0;
  const activeVariant = useMemo(() => (hasVariants ? findVariant(product, selection) : null), [product, selection, hasVariants]);
  const active = useMemo(() => resolveActive(product, activeVariant), [product, activeVariant]);
  const priceRange = useMemo(() => getPriceRange(product), [product]);
  const images = useMemo(() => (Array.isArray(product?.images) ? product.images.filter((i) => i && i.url) : []), [product]);
  const mainImage = active.image || images[selectedImageIndex]?.url || null;

  const brand = useMemo(() => {
    const n = (product?.name || '').toLowerCase();
    return BRANDS.find((b) => n.includes(b.name.toLowerCase()))?.name || null;
  }, [product]);

  const configLabel = useMemo(() => {
    if (!attributes.length) return '';
    return attributes.map((a) => selection[a.name]).filter(Boolean).join(' / ');
  }, [attributes, selection]);

  const quoteLabel = useMemo(() => {
    if (!product) return '';
    return `${product.name}${configLabel ? ` — ${configLabel}` : ''}`;
  }, [product, configLabel]);

  // Choose a value; keep other selections when a matching variant exists, else snap.
  const chooseValue = useCallback((attrName, value) => {
    const next = { ...selection, [attrName]: value };
    if (findVariant(product, next)) { setSelection(next); return; }
    const fallback = firstVariantWithValue(product, attrName, value);
    if (fallback) {
      const snapped = {};
      getAttributes(product).forEach((a) => { const v = getOptionValue(fallback, a.name); if (v != null) snapped[a.name] = v; });
      setSelection(snapped);
    } else {
      setSelection(next);
    }
  }, [product, selection]);

  const handleContactRequest = useCallback(async () => {
    if (sendingRequest) return; // prevent duplicate submissions
    if (!customerName?.trim()) { alert('Please enter your name'); return; }
    if (!mobileNumber?.trim()) { alert('Please enter your mobile number'); return; }
    if (!product) return;
    const unit = product.unit || '';
    const qtyLabel = quantity ? `${quantity}${unit ? ` ${unit}` : ''}` : '';
    setSendingRequest(true);
    try {
      const response = await fetch('/api/contact-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          productName: `${quoteLabel || product.name || 'Unknown Product'}${qtyLabel ? ` (Qty: ${qtyLabel})` : ''}`,
          productId: product._id || '',
          mobileNumber: mobileNumber.trim(),
          category: product.category?.name || '',
          price: active.price || product.price || '',
        }),
      });
      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        throw new Error(e.message || 'Failed'); // email failed → do NOT open WhatsApp
      }
      // Email sent → hand off to WhatsApp with product + variant + qty pre-filled
      const waUrl = buildProductWa({
        name: customerName.trim(),
        phone: mobileNumber.trim(),
        productName: product.name,
        variant: configLabel,
        price: formatINR(active.price),
        quantity,
        unit,
        url: typeof window !== 'undefined' ? window.location.href : SITE.url,
      });
      setSentWaUrl(waUrl);
      setRequestSent(true);
      setCustomerName(''); setMobileNumber(''); setQuantity('');
      openWhatsApp(waUrl);
    } catch (error) { alert('Could not send your request. Please try again.'); }
    finally { setSendingRequest(false); }
  }, [product, customerName, mobileNumber, quantity, quoteLabel, configLabel, active.price, sendingRequest]);

  const whatsappQuote = useMemo(() => {
    if (!product) return waLink('');
    const url = typeof window !== 'undefined' ? window.location.href : SITE.url;
    const msg = `Hi Total Office Solutions, I'd like a wholesale quote for:\n\n*${quoteLabel}*\n${active.sku ? `SKU: ${active.sku}\n` : ''}Approx price: ${formatINR(active.price)}\n${url}`;
    return waLink(msg);
  }, [product, quoteLabel, active.sku, active.price]);

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const id = String(product._id);
      const list = JSON.parse(localStorage.getItem('tos_wishlist') || '[]');
      const set = new Set(Array.isArray(list) ? list : []);
      set.has(id) ? set.delete(id) : set.add(id);
      localStorage.setItem('tos_wishlist', JSON.stringify([...set]));
      setWishlisted(set.has(id));
    } catch (e) {}
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : SITE.url;
    try {
      if (navigator.share) await navigator.share({ title: product?.name, url });
      else { await navigator.clipboard.writeText(url); setShareMsg('Link copied!'); setTimeout(() => setShareMsg(''), 2000); }
    } catch (e) {}
  };

  const onZoomMove = (e) => {
    const el = zoomRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const memoRelated = useMemo(() => (Array.isArray(relatedProducts) ? relatedProducts : []), [relatedProducts]);
  const memoOther = useMemo(() => (Array.isArray(otherProducts) ? otherProducts : []), [otherProducts]);
  const frequentlyBought = useMemo(() => memoRelated.slice(0, 3), [memoRelated]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadWrap}><div className={styles.spinner} /><p>Loading product details…</p></div>
      </>
    );
  }
  if (!product) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.noProduct}>
            <Icon name="box" size={54} />
            <h2>Product Not Available</h2>
            <p>The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/products" className={styles.backToProducts}>← Back to Products</Link>
          </div>
        </div>
      </>
    );
  }

  const inStock = active.inStock;
  const unit = product.unit || '';
  const moqLabel = `${active.minOrderQuantity} ${unit || (active.minOrderQuantity > 1 ? 'units' : 'unit')}`;

  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link><Icon name="chevron" size={14} className={styles.crumbSep} />
            <Link href="/products">Products</Link><Icon name="chevron" size={14} className={styles.crumbSep} />
            <span>{titleCase(product.name)}</span>
          </nav>

          <div className={styles.detail}>
            {/* Gallery */}
            <div className={styles.galleryCol}>
              <div className={styles.gallerySticky}>
                <div
                  className={styles.mainImageBox}
                  ref={zoomRef}
                  onMouseMove={onZoomMove}
                  onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
                  onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}
                >
                  {mainImage ? (
                    <SmartImage
                      key={mainImage}
                      src={mainImage}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 980px) 94vw, 560px"
                      objectFit="contain"
                      imgStyle={{ padding: 26, boxSizing: 'border-box' }}
                      wrapStyle={zoom.active
                        ? { transform: `scale(1.9)`, transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: 'transform .12s ease-out' }
                        : { transition: 'transform .2s ease-out' }}
                      fallback={<div className={styles.noImage}><span>TOS</span></div>}
                    />
                  ) : (
                    <div className={styles.noImage}><span>TOS</span></div>
                  )}
                  <div className={styles.galleryBadges}>
                    {product.featured && <span className={`${styles.gBadge} ${styles.gFeatured}`}><Icon name="star" size={13} /> Featured</span>}
                    <span className={`${styles.gBadge} ${inStock ? styles.gStock : styles.gOut}`}><Icon name={inStock ? 'check' : 'clock'} size={13} /> {inStock ? 'In Stock' : 'Made to Order'}</span>
                  </div>
                  {mainImage && <span className={styles.zoomHint}><Icon name="search" size={14} /> Hover to zoom</span>}
                </div>

                {images.length > 1 && (
                  <div className={styles.thumbs}>
                    {images.map((image, index) => (
                      <button
                        key={index}
                        className={`${styles.thumb} ${selectedImageIndex === index && !active.image ? styles.thumbActive : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <SmartImage
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="80px"
                          objectFit="contain"
                          imgStyle={{ padding: 8, boxSizing: 'border-box' }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className={styles.infoCol}>
              <div className={styles.infoHead}>
                <div className={styles.chips}>
                  <Link href="/products" className={styles.catChip}>{titleCase(product.category?.name) || 'Uncategorized'}</Link>
                  {brand && <span className={styles.brandBadge}><Icon name="badge" size={13} /> {brand}</span>}
                </div>
                <div className={styles.headActions}>
                  <button className={`${styles.iconBtn} ${wishlisted ? styles.wishOn : ''}`} onClick={toggleWishlist} aria-label="Save to wishlist" title="Save"><Icon name="heart" size={19} /></button>
                  <button className={styles.iconBtn} onClick={handleShare} aria-label="Share" title="Share"><Icon name="share" size={18} /></button>
                  {shareMsg && <span className={styles.shareMsg}>{shareMsg}</span>}
                </div>
              </div>

              <h1 className={styles.title}>{titleCase(product.name)}</h1>
              <div className={styles.ratingRow}>
                <span className={styles.stars}>{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size={15} />)}</span>
                <span className={styles.ratingText}>Trusted by 3,500+ businesses</span>
              </div>

              {/* Buy box */}
              <div className={styles.buyBox}>
                <div className={styles.priceRow}>
                  <div className={styles.priceMain}>
                    <span className={styles.priceValue}>{formatINR(active.price)}</span>
                    {unit && <span className={styles.priceUnit}>/ {unit}</span>}
                    {!priceRange.single && !activeVariant && <span className={styles.priceFrom}>onwards</span>}
                  </div>
                  <span className={`${styles.availPill} ${inStock ? styles.availIn : styles.availOut}`}>
                    <span className={styles.availDot} /> {inStock ? 'In Stock' : 'On Order'}
                  </span>
                </div>
                <p className={styles.priceTax}>Indicative unit price · +GST · volume discounts applied on quote</p>

                {/* Multi-attribute variant selectors */}
                {attributes.length > 0 && (
                  <div className={styles.variantGroups}>
                    {attributes.map((attr) => {
                      const otherSel = { ...selection }; delete otherSel[attr.name];
                      const values = (attr.values || []).map((value) => ({
                        value,
                        exists: valueExists(product, attr.name, value),
                        available: isValueAvailable(product, attr.name, value, otherSel),
                        selected: selection[attr.name] === value,
                      }));
                      return (
                        <VariantSelector
                          key={attr._id || attr.name}
                          name={attr.name}
                          chosen={selection[attr.name]}
                          values={values}
                          onSelect={(v) => chooseValue(attr.name, v)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Selected Configuration summary */}
                {hasVariants && (
                  <div className={styles.config}>
                    <div className={styles.configTitle}><Icon name="check" size={15} /> Selected Configuration</div>
                    <dl className={styles.configList}>
                      {attributes.map((a) => selection[a.name] ? (
                        <div key={a.name} className={styles.configRow}><dt>{a.name}</dt><dd>{selection[a.name]}</dd></div>
                      ) : null)}
                      {brand && <div className={styles.configRow}><dt>Brand</dt><dd>{brand}</dd></div>}
                      <div className={styles.configRow}><dt>Price</dt><dd className={styles.configPrice}>{formatINR(active.price)}{unit ? ` / ${unit}` : ''}</dd></div>
                      <div className={styles.configRow}><dt>Availability</dt><dd className={inStock ? styles.configOk : styles.configWarn}>{inStock ? 'In Stock' : 'Out of Stock'}</dd></div>
                      <div className={styles.configRow}><dt>Minimum Order</dt><dd>{moqLabel}</dd></div>
                      {active.sku && <div className={styles.configRow}><dt>SKU</dt><dd>{active.sku}</dd></div>}
                    </dl>
                  </div>
                )}

                {/* Base (no-variant) meta */}
                {!hasVariants && (
                  <div className={styles.metaRow}>
                    <span><Icon name="box" size={16} /> Min. order&nbsp;<b>{moqLabel}</b></span>
                    {inStock && <span><Icon name="layers" size={16} /> <b>{active.stock}</b>&nbsp;{unit || 'available'}</span>}
                    {active.sku && <span><Icon name="tag" size={16} /> SKU&nbsp;<b>{active.sku}</b></span>}
                  </div>
                )}

                <div className={styles.actions}>
                  <a href="#quote" className={`${styles.btn} ${styles.btnPrimary}`}>Request Quote <Icon name="arrow" size={18} /></a>
                  <a href={whatsappQuote} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnWa}`}><Icon name="whatsapp" size={19} /> WhatsApp</a>
                </div>
                <a href={waLink(`Please share the product catalogue for ${quoteLabel}.`)} target="_blank" rel="noopener noreferrer" className={styles.catalogueLink}>
                  <Icon name="download" size={16} /> Download product catalogue (PDF)
                </a>
              </div>

              <div className={styles.trustRow}>
                <span><Icon name="badge" size={18} /> 100% Genuine</span>
                <span><Icon name="truck" size={18} /> Fast Delivery</span>
                <span><Icon name="shield" size={18} /> GST Invoice</span>
                <span><Icon name="headset" size={18} /> Bulk Support</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsSection}>
            <div className={styles.tabBar} role="tablist">
              {TABS.map((t) => (
                <button key={t} role="tab" aria-selected={activeTab === t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            <div className={styles.tabPanel}>
              {activeTab === 'Description' && <div className={styles.prose}><p>{product.description || 'No description available for this product.'}</p></div>}
              {activeTab === 'Specifications' && <SpecTable product={product} active={active} selection={selection} attributes={attributes} />}
              {activeTab === 'Applications' && (
                <div className={styles.prose}>
                  <p>{product.name} is well-suited for professional and industrial use across the sectors we serve:</p>
                  <ul className={styles.appList}>
                    {['Corporate offices & commercial buildings', 'Manufacturing & industrial plants', 'Real estate & infrastructure projects', 'Electrical contracting & fit-outs', 'Institutions, hospitals & hospitality'].map((a) => (<li key={a}><Icon name="check" size={16} /> {a}</li>))}
                  </ul>
                  <p className={styles.muted}>For project-specific suitability or datasheets, request a quote and our technical desk will assist.</p>
                </div>
              )}
              {activeTab === 'Shipping' && (
                <div className={styles.prose}>
                  <div className={styles.shipGrid}>
                    <div><Icon name="truck" size={22} /><b>Pan-India Delivery</b><span>Reliable logistics for bulk and corporate orders.</span></div>
                    <div><Icon name="box" size={22} /><b>Bulk Dispatch</b><span>Minimum order {active.minOrderQuantity} {active.minOrderQuantity > 1 ? 'units' : 'unit'}; scaled pricing on volume.</span></div>
                    <div><Icon name="shield" size={22} /><b>GST-Compliant</b><span>Proper tax invoicing for seamless input credit.</span></div>
                    <div><Icon name="headset" size={22} /><b>Order Tracking</b><span>Dedicated point of contact from quote to delivery.</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quote */}
          <div className={styles.quoteSection} id="quote">
            <div className={styles.quoteInfo}>
              <span className={styles.quoteEyebrow}><span className={styles.dot} /> Get Best Price</span>
              <h2>Request a wholesale quote</h2>
              <p>Share your details and our corporate desk will get back with the best bulk pricing for <strong>{quoteLabel}</strong>.</p>
              <ul className={styles.quotePerks}>
                <li><Icon name="check" size={16} /> Transparent, GST-compliant pricing</li>
                <li><Icon name="check" size={16} /> Volume discounts on bulk orders</li>
                <li><Icon name="check" size={16} /> Fast response — usually within hours</li>
              </ul>
            </div>
            <div className={styles.quoteForm}>
              {requestSent ? (
                <div className={styles.sentBox}>
                  <div className={`${styles.sentIcon} ${styles.pop}`}><Icon name="check" size={30} /></div>
                  <h3>Request Sent!</h3>
                  <p>We&apos;ve emailed your enquiry. If WhatsApp didn&apos;t open automatically, tap below — your message is ready, just press Send.</p>
                  <a href={sentWaUrl || whatsappQuote} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnWa}`}><Icon name="whatsapp" size={19} /> Chat on WhatsApp</a>
                </div>
              ) : (
                <>
                  <label className={styles.field}><span>Your Name</span><input type="text" placeholder="e.g. Rajesh Kumar" value={customerName} onChange={handleNameChange} disabled={sendingRequest} /></label>
                  <label className={styles.field}><span>Mobile Number</span><input type="tel" placeholder="10-digit mobile number" value={mobileNumber} onChange={handleMobileChange} maxLength={10} disabled={sendingRequest} /></label>
                  <label className={styles.field}>
                    <span>Required Quantity{unit ? ` (in ${unit})` : ''}</span>
                    <input type="text" inputMode="numeric" placeholder={`e.g. 500${unit ? ` ${unit}` : ''}`} value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={sendingRequest} />
                  </label>
                  <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`} onClick={handleContactRequest} disabled={sendingRequest}>
                    {sendingRequest ? 'Sending…' : 'Request Quote on WhatsApp'} <Icon name="whatsapp" size={18} />
                  </button>
                  <p className={styles.formNote}>By submitting you agree to be contacted about your enquiry.</p>
                </>
              )}
            </div>
          </div>

          {frequentlyBought.length > 0 && (
            <section className={styles.fbtSection}>
              <h2 className={styles.sectionTitle}>Frequently Bought Together</h2>
              <div className={styles.fbtGrid}>{frequentlyBought.map((p) => <ProductCard key={p._id} product={p} />)}</div>
            </section>
          )}
          {memoRelated.length > 0 && (
            <section className={styles.relatedSection}>
              <h2 className={styles.sectionTitle}>More from {titleCase(product.category?.name)}</h2>
              <div className={styles.relatedGrid}>{memoRelated.map((p) => <ProductCard key={p._id} product={p} />)}</div>
            </section>
          )}
          {memoOther.length > 0 && (
            <section className={styles.relatedSection}>
              <h2 className={styles.sectionTitle}>You may also like</h2>
              <div className={styles.relatedGrid}>{memoOther.map((p) => <ProductCard key={p._id} product={p} />)}</div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky mobile action bar */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarInfo}>
          <span className={styles.mobileBarPrice}>{formatINR(active.price)}</span>
          <span className={styles.mobileBarMeta}>{configLabel || (inStock ? 'In stock' : 'On order')}</span>
        </div>
        <a href={whatsappQuote} target="_blank" rel="noopener noreferrer" className={styles.mobileBarWa} aria-label="WhatsApp quote"><Icon name="whatsapp" size={22} /></a>
        <a href="#quote" className={styles.mobileBarCta}>Get Quote</a>
      </div>

      <Footer />
    </>
  );
}

/** Specifications table — merges product.specifications with selected options/meta. */
function SpecTable({ product, active, selection, attributes }) {
  const specs = product.specifications && typeof product.specifications === 'object'
    ? Object.entries(product.specifications).filter(([k, v]) => k && v) : [];
  const meta = [
    ['Category', titleCase(product.category?.name)],
    ...attributes.map((a) => (selection[a.name] ? [a.name, selection[a.name]] : null)),
    active.sku ? ['SKU', active.sku] : null,
    product.unit ? ['Selling Unit', product.unit] : null,
    ['Minimum Order', `${active.minOrderQuantity} ${product.unit || (active.minOrderQuantity > 1 ? 'units' : 'unit')}`],
  ].filter(Boolean);

  if (specs.length === 0 && meta.length === 0) return <p className={styles.muted}>No specifications listed for this product.</p>;
  return (
    <table className={styles.specTable}>
      <tbody>
        {specs.map(([k, v]) => (<tr key={k}><th>{String(k)}</th><td>{String(v)}</td></tr>))}
        {meta.map(([k, v]) => (<tr key={k}><th>{k}</th><td>{v}</td></tr>))}
      </tbody>
    </table>
  );
}
