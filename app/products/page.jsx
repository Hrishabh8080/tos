'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Icon from '@/components/ui/Icon';
import dynamic from 'next/dynamic';
import ProductCard from '@/components/ui/ProductCard';
import HScroll from '@/components/ui/HScroll';

// Lazy-load the Quick View modal (and its framer-motion dep) only when opened
const QuickView = dynamic(() => import('@/components/products/QuickView'), { ssr: false });
import { deduplicatedFetch } from '@/lib/utils/fetchCache';
import { getPriceRange } from '@/lib/utils/variants';
import { titleCase } from '@/lib/utils/format';
import { BRANDS } from '@/lib/site';
import styles from './Products.module.css';

const PRICE_BUCKETS = [
  { key: 'all', label: 'All Prices' },
  { key: '0-500', label: 'Under ₹500', min: 0, max: 500 },
  { key: '500-2000', label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { key: '2000-5000', label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { key: '5000+', label: 'Above ₹5,000', min: 5000, max: Infinity },
];

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name: A–Z' },
];

// Product helpers (variant-aware)
const priceOf = (p) => getPriceRange(p).min;
const brandOf = (p) => {
  const n = (p?.name || '').toLowerCase();
  return BRANDS.find((b) => n.includes(b.name.toLowerCase()))?.name || null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // [] = all
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceBucket, setPriceBucket] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const [mobileFilters, setMobileFilters] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (forceRefresh = false) => {
    try {
      const CK_P = 'tos_products_cache';
      const CK_C = 'tos_categories_cache';
      const DUR = 5 * 60 * 1000;

      // Use cache first. If BOTH products & categories are still fresh, serve them
      // and SKIP the network entirely — no redundant API call on reload.
      if (!forceRefresh) {
        try {
          const cp = JSON.parse(sessionStorage.getItem(CK_P) || 'null');
          const cc = JSON.parse(sessionStorage.getItem(CK_C) || 'null');
          const pFresh = cp?.data && cp?.timestamp && Date.now() - cp.timestamp < DUR;
          const cFresh = cc?.data && cc?.timestamp && Date.now() - cc.timestamp < DUR;
          if (pFresh) setProducts(Array.isArray(cp.data) ? cp.data.filter((p) => p && p.category) : []);
          if (cFresh) setCategories(Array.isArray(cc.data) ? cc.data : []);
          if (pFresh && cFresh) {
            setLoading(false);
            return; // fresh cache → do not hit the API again
          }
        } catch (e) {}
      }

      const [pRes, cRes] = await Promise.all([
        deduplicatedFetch('/api/products'),
        deduplicatedFetch('/api/categories'),
      ]);

      if (pRes.ok && pRes.headers.get('content-type')?.includes('application/json')) {
        const data = await pRes.json();
        const valid = Array.isArray(data) ? data.filter((p) => p && p.category) : [];
        setProducts(valid);
        try { sessionStorage.setItem(CK_P, JSON.stringify({ data: valid, timestamp: Date.now() })); } catch (e) {}
      }
      if (cRes.ok && cRes.headers.get('content-type')?.includes('application/json')) {
        const data = await cRes.json();
        setCategories(Array.isArray(data) ? data : []);
        try { sessionStorage.setItem(CK_C, JSON.stringify({ data, timestamp: Date.now() })); } catch (e) {}
      }
    } catch (error) {
      try {
        const cp = sessionStorage.getItem('tos_products_cache');
        if (cp) { const parsed = JSON.parse(cp); if (Array.isArray(parsed?.data)) setProducts(parsed.data.filter((p) => p && p.category)); }
        const cc = sessionStorage.getItem('tos_categories_cache');
        if (cc) { const parsed = JSON.parse(cc); if (Array.isArray(parsed?.data)) setCategories(parsed.data); }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  // Derived facets
  const categoryCounts = useMemo(() => {
    const m = {};
    products.forEach((p) => { const id = p.category?._id; if (id) m[id] = (m[id] || 0) + 1; });
    return m;
  }, [products]);

  const brandFacets = useMemo(() => {
    const m = {};
    products.forEach((p) => { const b = brandOf(p); if (b) m[b] = (m[b] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p && p.category);

    if (selectedCategories.length) list = list.filter((p) => selectedCategories.includes(p.category?._id));

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(brandOf(p)));

    if (priceBucket !== 'all') {
      const b = PRICE_BUCKETS.find((x) => x.key === priceBucket);
      if (b) list = list.filter((p) => { const pr = priceOf(p); return pr >= b.min && pr < b.max; });
    }

    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc': sorted.sort((a, b) => priceOf(a) - priceOf(b)); break;
      case 'price-desc': sorted.sort((a, b) => priceOf(b) - priceOf(a)); break;
      case 'name': sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'newest': sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      default: sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
  }, [products, selectedCategories, searchTerm, selectedBrands, priceBucket, sortBy]);

  const toggleBrand = useCallback((name) => {
    setSelectedBrands((prev) => (prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]));
  }, []);

  const toggleCategory = useCallback((id) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }, []);

  const activeFilterCount = selectedCategories.length + selectedBrands.length + (priceBucket !== 'all' ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]); setSelectedBrands([]); setPriceBucket('all'); setSearchTerm('');
  };

  const FilterPanel = (
    <div className={styles.filterInner}>
      <div className={styles.filterHead}>
        <h3><Icon name="filter" size={18} /> Filters</h3>
        {activeFilterCount > 0 && <button className={styles.clearBtn} onClick={clearAll}>Clear all</button>}
      </div>

      {/* Category */}
      <div className={styles.filterGroup}>
        <span className={styles.groupTitle}>Category</span>
        <ul className={`${styles.optList} ${categories.length > 10 ? styles.optListScroll : ''}`}>
          <li>
            <button className={`${styles.opt} ${selectedCategories.length === 0 ? styles.optOn : ''}`} onClick={() => setSelectedCategories([])}>
              <span>All Products</span><em>{products.length}</em>
            </button>
          </li>
          {categories.map((c) => c && c._id ? (
            <li key={c._id}>
              <label className={styles.check}>
                <input type="checkbox" checked={selectedCategories.includes(c._id)} onChange={() => toggleCategory(c._id)} />
                <span className={styles.checkbox}><Icon name="check" size={13} /></span>
                <span className={styles.checkLabel}>{titleCase(c.name)}</span>
                <em>{categoryCounts[c._id] || 0}</em>
              </label>
            </li>
          ) : null)}
        </ul>
      </div>

      {/* Brand */}
      {brandFacets.length > 0 && (
        <div className={styles.filterGroup}>
          <span className={styles.groupTitle}>Brand</span>
          <ul className={`${styles.optList} ${brandFacets.length > 10 ? styles.optListScroll : ''}`}>
            {brandFacets.map((b) => (
              <li key={b.name}>
                <label className={styles.check}>
                  <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} />
                  <span className={styles.checkbox}><Icon name="check" size={13} /></span>
                  <span className={styles.checkLabel}>{b.name}</span>
                  <em>{b.count}</em>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price */}
      <div className={styles.filterGroup}>
        <span className={styles.groupTitle}>Price Range</span>
        <ul className={styles.optList}>
          {PRICE_BUCKETS.map((b) => (
            <li key={b.key}>
              <label className={styles.radio}>
                <input type="radio" name="price" checked={priceBucket === b.key} onChange={() => setPriceBucket(b.key)} />
                <span className={styles.dot} />
                <span>{b.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );

  return (
    <>
      <Header />

      {/* Compact hero */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroInner}>
          <nav className={styles.crumb}><Link href="/">Home</Link><Icon name="chevron" size={13} /><span>Products</span></nav>
          <h1>Our Product Catalogue</h1>
          <p>Genuine electrical & office supplies from India&apos;s leading brands — at wholesale rates.</p>
          <div className={styles.heroSearch}>
            <Icon name="search" size={20} />
            <input type="text" placeholder="Search products, brands, categories…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button onClick={() => setSearchTerm('')} aria-label="Clear"><Icon name="close" size={18} /></button>}
          </div>
        </div>
      </section>

      {/* Category cards */}
      {categories.length > 0 && (
        <div className={styles.catCards}>
          <div className={styles.catCardsInner}>
            <HScroll className={styles.catCardsTrack}>
              <button className={`${styles.catCard} ${selectedCategories.length === 0 ? styles.catCardOn : ''}`} onClick={() => setSelectedCategories([])}>
                <span className={styles.catIcon}><Icon name="layers" size={22} /></span>
                <b>All Products</b><em>{products.length} items</em>
              </button>
              {categories.map((c) => c && c._id ? (
                <button key={c._id} className={`${styles.catCard} ${selectedCategories.includes(c._id) ? styles.catCardOn : ''}`} onClick={() => toggleCategory(c._id)}>
                  <span className={styles.catIcon}><Icon name={selectedCategories.includes(c._id) ? 'check' : 'box'} size={22} /></span>
                  <b>{titleCase(c.name)}</b><em>{categoryCounts[c._id] || 0} items</em>
                </button>
              ) : null)}
            </HScroll>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>{FilterPanel}</aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.resultInfo}>
              <button className={styles.mobFilterBtn} onClick={() => setMobileFilters(true)}>
                <Icon name="filter" size={16} /> Filters {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
              </button>
              <span className={styles.count}><b>{filtered.length}</b> product{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <label className={styles.sortWrap}>
              <span>Sort</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
                {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <Icon name="chevron" size={15} className={styles.sortChev} />
            </label>
          </div>

          {/* Active chips */}
          {activeFilterCount > 0 && (
            <div className={styles.activeChips}>
              {selectedCategories.map((id) => (
                <button key={id} className={styles.chip} onClick={() => toggleCategory(id)}>
                  {titleCase(categories.find((c) => c._id === id)?.name)} <Icon name="close" size={13} />
                </button>
              ))}
              {selectedBrands.map((b) => (
                <button key={b} className={styles.chip} onClick={() => toggleBrand(b)}>{b} <Icon name="close" size={13} /></button>
              ))}
              {priceBucket !== 'all' && (
                <button className={styles.chip} onClick={() => setPriceBucket('all')}>
                  {PRICE_BUCKETS.find((x) => x.key === priceBucket)?.label} <Icon name="close" size={13} />
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeleton}>
                  <div className={styles.skMedia} />
                  <div className={styles.skBody}><div className={styles.skLine} style={{ width: '55%' }} /><div className={styles.skLine} /><div className={styles.skLine} style={{ width: '40%' }} /></div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map((p, i) => <ProductCard key={p._id} product={p} onQuickView={setQuickViewId} priority={i < 4} />)}
            </div>
          ) : (
            <div className={styles.empty}>
              <Icon name="search" size={44} />
              <h3>No products match your filters</h3>
              <p>Try adjusting or clearing your filters to see more results.</p>
              <button className={styles.emptyBtn} onClick={clearAll}>Clear all filters</button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      <div className={`${styles.mobOverlay} ${mobileFilters ? styles.mobShow : ''}`} onClick={() => setMobileFilters(false)} />
      <aside className={`${styles.mobDrawer} ${mobileFilters ? styles.mobOpen : ''}`}>
        <div className={styles.mobHead}>
          <h3>Filters</h3>
          <button onClick={() => setMobileFilters(false)} aria-label="Close"><Icon name="close" size={22} /></button>
        </div>
        <div className={styles.mobBody}>{FilterPanel}</div>
        <div className={styles.mobFoot}>
          <button className={styles.applyBtn} onClick={() => setMobileFilters(false)}>Show {filtered.length} results</button>
        </div>
      </aside>

      {quickViewId && <QuickView productId={quickViewId} onClose={() => setQuickViewId(null)} />}

      <Footer />
    </>
  );
}
