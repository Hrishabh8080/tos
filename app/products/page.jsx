'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import { deduplicatedFetch } from '@/lib/utils/fetchCache';
import styles from './Products.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (forceRefresh = false) => {
    try {
      const CACHE_KEY_PRODUCTS = 'tos_products_cache';
      const CACHE_KEY_CATEGORIES = 'tos_categories_cache';
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      // Check cache for products
      if (!forceRefresh) {
        try {
          const cachedProducts = sessionStorage.getItem(CACHE_KEY_PRODUCTS);
          if (cachedProducts) {
            const parsed = JSON.parse(cachedProducts);
            if (parsed && parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
              const validProducts = Array.isArray(parsed.data) ? parsed.data.filter((product) => product && product.category) : [];
              setProducts(validProducts);
            } else {
            }
          }
        } catch (cacheError) {
        }
      }

      // Check cache for categories
      if (!forceRefresh) {
        try {
          const cachedCategories = sessionStorage.getItem(CACHE_KEY_CATEGORIES);
          if (cachedCategories) {
            const parsed = JSON.parse(cachedCategories);
            if (parsed && parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
              const validCategories = Array.isArray(parsed.data) ? parsed.data : [];
            setCategories(validCategories);
            } else {
            }
          }
        } catch (cacheError) {
        }
      }

      // Fetch fresh data if cache is missing or expired (with deduplication)
      const [productsRes, categoriesRes] = await Promise.all([
        deduplicatedFetch('/api/products'),
        deduplicatedFetch('/api/categories'),
      ]);

      // Check if response is JSON before parsing
      const productsContentType = productsRes.headers.get('content-type');
      const categoriesContentType = categoriesRes.headers.get('content-type');

      // Handle products response
      if (productsRes.ok && productsContentType?.includes('application/json')) {
      const productsData = await productsRes.json();
        // Filter out products without categories to prevent errors
        const validProducts = productsData.filter((product) => product.category);
        setProducts(validProducts);
        
        // Cache products
        try {
          sessionStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify({
            data: validProducts,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
        }

        // Log warning if any products were filtered out
      } else {
        // Don't clear state if we have cached data
        if (!sessionStorage.getItem(CACHE_KEY_PRODUCTS)) {
          setProducts([]);
        }
      }

      // Handle categories response
      if (categoriesRes.ok && categoriesContentType?.includes('application/json')) {
      const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        
        // Cache categories
        try {
          sessionStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify({
            data: categoriesData,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
        }
      } else {
        // Don't clear state if we have cached data
        if (!sessionStorage.getItem(CACHE_KEY_CATEGORIES)) {
          setCategories([]);
        }
      }
    } catch (error) {
      // Try to use cached data if available
      try {
        const cachedProducts = sessionStorage.getItem('tos_products_cache');
        if (cachedProducts) {
          const parsed = JSON.parse(cachedProducts);
          if (parsed && parsed.data && Array.isArray(parsed.data)) {
            const validProducts = parsed.data.filter((product) => product && product.category);
            setProducts(validProducts);
          }
        } else {
          setProducts([]);
        }
      } catch (cacheError) {
        setProducts([]);
        setFilteredProducts([]);
      }

      try {
        const cachedCategories = sessionStorage.getItem('tos_categories_cache');
        if (cachedCategories) {
          const parsed = JSON.parse(cachedCategories);
          if (parsed && parsed.data && Array.isArray(parsed.data)) {
            setCategories(parsed.data);
          }
        } else {
          setCategories([]);
        }
      } catch (cacheError) {
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Memoized filter function - only recalculates when dependencies change
  const filteredProducts = useMemo(() => {
    try {
      // Start with products that have valid categories
      if (!Array.isArray(products)) {
        return [];
      }

      let filtered = products.filter((product) => product && product.category);

    // Filter by category
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(
          (product) => product && product.category && product.category._id === selectedCategory
        );
    }

    // Filter by search term
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) => {
          if (!product || !product.name) return false;
          const nameMatch = product.name.toLowerCase().includes(searchLower);
          const descMatch = product.description 
            ? product.description.toLowerCase().includes(searchLower) 
            : false;
          return nameMatch || descMatch;
        }
      );
    }

      return filtered;
    } catch (error) {
      return [];
    }
  }, [products, selectedCategory, searchTerm]);

  // Memoized function to get products by category
  const getProductsByCategory = useCallback((categoryId) => {
    try {
      if (!Array.isArray(filteredProducts) || !categoryId) {
        return [];
      }
      return filteredProducts.filter(
        (product) => product && product.category && product.category._id === categoryId
      );
    } catch (error) {
      return [];
    }
  }, [filteredProducts]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <video 
            className={styles.heroVideo}
            autoPlay
            loop
            muted
            playsInline
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          >
            <source src="/videos/DemoImage.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1>Our Products</h1>
            <p>Discover our wide range of quality products</p>
          </div>
        </section>

      {/* Search and Filter Section */}
      <section className={styles.filterSection}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              className={styles.clearBtn} 
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </button>
          {Array.isArray(categories) && categories.map((category) => (
            category && category._id ? (
            <button
              key={category._id}
              className={`${styles.categoryBtn} ${selectedCategory === category._id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category._id)}
            >
                {category.name || 'Unnamed Category'}
            </button>
            ) : null
          ))}
        </div>
      </section>

      {/* Products Grid by Category */}
      {selectedCategory === 'all' ? (
        // Show products grouped by category
        <div className={styles.mainContent}>
          {!Array.isArray(products) || products.length === 0 ? (
            <div className={styles.noProducts}>
              <p>No products available</p>
            </div>
          ) : (
            Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => {
                if (!category || !category._id) return null;
            const categoryProducts = getProductsByCategory(category._id);
                if (!Array.isArray(categoryProducts) || categoryProducts.length === 0) return null;

            return (
              <section key={category._id} className={styles.categorySection}>
                <div className={styles.categorySectionHeader}>
                  <div>
                        <h2>{category.name || 'Unnamed Category'}</h2>
                    {category.description && <p>{category.description}</p>}
                  </div>
                  {categoryProducts.length > 4 && (
                    <button
                      onClick={() => setSelectedCategory(category._id)}
                      className={styles.viewAllBtn}
                    >
                      View All →
                    </button>
                  )}
                </div>

                <div className={styles.productsGrid}>
                      {categoryProducts.slice(0, 4).map((product, index) => (
                        product && product._id ? (
                          <ProductCard key={product._id} product={product} index={index} />
                        ) : null
                  ))}
                </div>
              </section>
            );
              })
            ) : (
              <div className={styles.noProducts}>
                <p>No products available</p>
              </div>
            )
          )}
        </div>
      ) : (
        // Show filtered products
        <div className={styles.mainContent}>
          <section className={styles.categorySection}>
            <div className={styles.productsCount}>
              <h2>
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            {filteredProducts.length > 0 ? (
              <div className={styles.productsGrid}>
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className={styles.noProducts}>
                <p>No products found</p>
              </div>
            )}
          </section>
        </div>
      )}

      </div>
    </>
  );
}

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = React.memo(function ProductCard({ product, index = 0 }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product || !product._id) {
    return null;
  }

  // Different font styles for each card (cycling through styles)
  const fontStyles = [
    styles.tosStyle1, // Bold, Modern
    styles.tosStyle2, // Elegant, Serif
    styles.tosStyle3, // Playful, Rounded
    styles.tosStyle4, // Geometric, Sans-serif
    styles.tosStyle5, // Classic, Condensed
    styles.tosStyle6, // Decorative, Script
  ];
  const tosStyleClass = fontStyles[index % fontStyles.length];

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  try {
    const hasImage = product.images && Array.isArray(product.images) && product.images[0] && product.images[0].url;
    const showTOSFallback = !hasImage || imageError;

  return (
    <div className={styles.productCard}>
      {product.featured && <div className={styles.featuredBadge}>Featured</div>}
        <Link href={`/products/${product._id}`} className={styles.imageContainer}>
          {hasImage && !imageError ? (
            <img 
              src={product.images[0].url} 
              alt={product.name || 'Product'}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          ) : null}
          {showTOSFallback && (
            <div className={`${styles.tosFallback} ${tosStyleClass}`}>
              <span className={styles.tosText}>TOS</span>
            </div>
        )}
        </Link>
      <div className={styles.productInfo}>
          <div className={styles.categoryTag}>{product.category?.name || 'Uncategorized'}</div>
          <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ cursor: 'pointer' }}>{product.name || 'Unnamed Product'}</h3>
          </Link>
        <p className={styles.description}>
            {product.description && product.description.length > 100
            ? product.description.substring(0, 100) + '...'
              : product.description || 'No description available'}
        </p>
          {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
          <div className={styles.specifications}>
            {Object.entries(product.specifications)
              .slice(0, 2)
              .map(([key, value]) => (
                  value && key ? (
                  <div key={key} className={styles.specItem}>
                      <span className={styles.specKey}>{String(key)}:</span>
                      <span className={styles.specValue}>{String(value)}</span>
                  </div>
                  ) : null
              ))}
          </div>
        )}
        <div className={styles.productFooter}>
            <div className={styles.price}>₹{product.price || 0}</div>
            <Link href={`/products/${product._id}`} className={styles.viewBtn}>View Details</Link>
        </div>
          {product.minOrderQuantity && product.minOrderQuantity > 1 && (
            <div className={styles.minOrderBadge}>Min. Order: {product.minOrderQuantity}</div>
          )}
          {typeof product.stock === 'number' && product.stock < 10 && product.stock > 0 && (
          <div className={styles.lowStock}>Only {product.stock} left!</div>
        )}
      </div>
    </div>
  );
  } catch (error) {
    return null;
}
});
