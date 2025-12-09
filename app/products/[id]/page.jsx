'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header/Header';
import { deduplicatedFetch } from '@/lib/utils/fetchCache';
import styles from './ProductDetail.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
  }, [params.id]);

  const fetchProduct = async (forceRefresh = false) => {
    try {
      if (!params || !params.id) {
        router.push('/products');
        return;
      }

      setLoading(true);
      const CACHE_KEY = `tos_product_${params.id}_cache`;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      // Check cache first
      if (!forceRefresh) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (data && timestamp && Date.now() - timestamp < CACHE_DURATION) {
            setProduct(data);
            setLoading(false);
            // Scroll to top when product loads from cache
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          }
        } catch (cacheError) {
          // Continue to fetch fresh data
        }
      }

      // Fetch fresh data
      if (!params.id) {
        router.push('/products');
        return;
      }
      
      const response = await deduplicatedFetch(`/api/products/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/products');
          return;
        }
        throw new Error('Failed to fetch product');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      // Clone response before reading to avoid "body stream already read" error
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      setProduct(data);
      
      // Scroll to top after product loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Cache product
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: data,
          timestamp: Date.now()
        }));
      } catch (cacheError) {
        // Continue even if caching fails
      }
    } catch (error) {
      // Try to use cached data if available
      try {
        const cached = sessionStorage.getItem(`tos_product_${params.id}_cache`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.data) {
            setProduct(parsed.data);
            setLoading(false);
            // Scroll to top even on error fallback
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      } catch (cacheError) {
      }
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  // Optimized: Fetch only related products instead of all products
  const fetchRelatedProducts = useCallback(async (forceRefresh = false) => {
    if (!params?.id) return;

    try {
      const CACHE_KEY = `tos_related_${params.id}_cache`;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      // Check cache first
      if (!forceRefresh) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
              setRelatedProducts(parsed.data.relatedProducts || []);
              setOtherProducts(parsed.data.otherProducts || []);
              return;
            }
          }
        } catch (cacheError) {
        }
      }

      // Fetch only related products (optimized endpoint)
      const response = await deduplicatedFetch(`/api/products/${params.id}/related`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          const related = Array.isArray(data.relatedProducts) ? data.relatedProducts : [];
          const other = Array.isArray(data.otherProducts) ? data.otherProducts : [];
          
          setRelatedProducts(related);
          setOtherProducts(other);
          
          // Cache results
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: { relatedProducts: related, otherProducts: other },
              timestamp: Date.now()
            }));
          } catch (cacheError) {
          }
        }
      }
    } catch (error) {
      setRelatedProducts([]);
      setOtherProducts([]);
    }
  }, [params.id]);

  const handleContactRequest = useCallback(async () => {
    if (!customerName || !customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      alert('Please enter your mobile number');
      return;
    }
    if (!product) return;

    setSendingRequest(true);
    try {
      const response = await fetch('/api/contact-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          productName: product.name || 'Unknown Product',
          productId: product._id || '',
          mobileNumber: mobileNumber.trim(),
          category: product.category?.name || '',
          price: product.price || '',
        }),
      });

      if (response.ok) {
        setRequestSent(true);
        setCustomerName('');
        setMobileNumber('');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send request' }));
        throw new Error(errorData.message || 'Failed to send request');
      }
    } catch (error) {
      alert('Failed to send request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  }, [product, customerName, mobileNumber]);

  // Memoized related products - no need to recalculate, already fetched
  const memoizedRelatedProducts = useMemo(() => {
    return Array.isArray(relatedProducts) ? relatedProducts : [];
  }, [relatedProducts]);

  const memoizedOtherProducts = useMemo(() => {
    return Array.isArray(otherProducts) ? otherProducts : [];
  }, [otherProducts]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading product details...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.noProduct}>
            <div className={styles.noProductIcon}>📦</div>
            <h2>Product Not Available</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/products" className={styles.backToProducts}>
              ← Back to Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* Product Detail Section */}
        <div className={styles.productDetail}>
          <div className={styles.productImages}>
            {product.images && product.images.length > 0 ? (
              <>
                <div className={styles.mainImageContainer}>
                  <img 
                    src={product.images[selectedImageIndex]?.url || ''} 
                    alt={product.name || 'Product'}
                    className={styles.mainImage}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                      e.target.onerror = null;
                    }}
                  />
                  {product.featured && (
                    <div className={styles.featuredBadge}>⭐ Featured Product</div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className={styles.thumbnailContainer}>
                    {product.images.map((image, index) => (
                      image && image.url ? (
                        <img
                          key={index}
                          src={image.url}
                          alt={`${product.name || 'Product'} ${index + 1}`}
                          className={`${styles.thumbnail} ${selectedImageIndex === index ? styles.thumbnailActive : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                            e.target.onerror = null;
                          }}
                        />
                      ) : null
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noImageLarge}>
                <span>No Image Available</span>
              </div>
            )}
          </div>

          <div className={styles.productInfo}>
            <div className={styles.categoryTag}>{product.category?.name}</div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.priceSection}>
              <span className={styles.price}>₹{product.price}</span>
              {product.stock > 0 && (
                <span className={styles.inStock}>✓ In Stock ({product.stock} available)</span>
              )}
              {product.minOrderQuantity && product.minOrderQuantity > 1 && (
                <span className={styles.minOrder}>📦 Minimum Order: {product.minOrderQuantity} units</span>
              )}
            </div>

            <div className={styles.descriptionSection}>
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
              <div className={styles.specificationsSection}>
                <h2>Specifications</h2>
                <div className={styles.specGrid}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    value && key ? (
                      <div key={key} className={styles.specRow}>
                        <span className={styles.specLabel}>{String(key)}:</span>
                        <span className={styles.specValue}>{String(value)}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            <div className={styles.contactSection}>
              <h3>Interested in this product?</h3>
              <p>Enter your details and we'll get back to you!</p>
              <div className={styles.contactForm}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={handleNameChange}
                  className={styles.nameInput}
                  disabled={requestSent}
                />
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  maxLength="10"
                  className={styles.mobileInput}
                  disabled={requestSent}
                />
                <button 
                  className={styles.contactBtn} 
                  onClick={handleContactRequest}
                  disabled={sendingRequest || requestSent}
                >
                  {sendingRequest ? 'Sending...' : requestSent ? '✓ Request Sent' : 'Request Callback'}
                </button>
              </div>
            </div>

            <div className={styles.backButton}>
              <Link href="/products" className={styles.backLink}>
                ← Back to Products
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {(memoizedRelatedProducts.length > 0 || memoizedOtherProducts.length > 0) ? (
          <div className={styles.relatedProductsSection}>
            {/* Same Category Products */}
            {memoizedRelatedProducts.length > 0 ? (
              <div className={styles.relatedSection}>
                <h2 className={styles.relatedTitle}>
                  More from {product.category?.name}
                </h2>
                <div className={styles.relatedProductsGrid}>
                  {memoizedRelatedProducts.map((relatedProduct) => {
                    if (!relatedProduct || !relatedProduct._id) return null;
                    const productId = String(relatedProduct._id);
                    return (
                      <Link
                        key={productId}
                        href={`/products/${productId}`}
                        className={styles.relatedProductCard}
                      >
                        {relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images[0] && relatedProduct.images[0].url ? (
                          <img
                            src={relatedProduct.images[0].url}
                            alt={relatedProduct.name || 'Product'}
                            className={styles.relatedProductImage}
                          />
                        ) : (
                          <div className={styles.relatedProductNoImage}>No Image</div>
                        )}
                        <div className={styles.relatedProductInfo}>
                          <h4 className={styles.relatedProductName}>{relatedProduct.name || 'Unnamed Product'}</h4>
                          <p className={styles.relatedProductPrice}>₹{relatedProduct.price || 0}</p>
                          {relatedProduct.featured && (
                            <span className={styles.relatedProductBadge}>⭐ Featured</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Other Category Products */}
            {memoizedOtherProducts.length > 0 ? (
              <div className={styles.relatedSection}>
                <h2 className={styles.relatedTitle}>Other Products</h2>
                <div className={styles.relatedProductsGrid}>
                  {memoizedOtherProducts.map((otherProduct) => {
                    if (!otherProduct || !otherProduct._id) return null;
                    const productId = String(otherProduct._id);
                    return (
                      <Link
                        key={productId}
                        href={`/products/${productId}`}
                        className={styles.relatedProductCard}
                      >
                        {otherProduct.images && Array.isArray(otherProduct.images) && otherProduct.images[0] && otherProduct.images[0].url ? (
                          <img
                            src={otherProduct.images[0].url}
                            alt={otherProduct.name || 'Product'}
                            className={styles.relatedProductImage}
                          />
                        ) : (
                          <div className={styles.relatedProductNoImage}>No Image</div>
                        )}
                        <div className={styles.relatedProductInfo}>
                          <div className={styles.relatedProductCategory}>
                            {otherProduct.category?.name || 'Uncategorized'}
                          </div>
                          <h4 className={styles.relatedProductName}>{otherProduct.name || 'Unnamed Product'}</h4>
                          <p className={styles.relatedProductPrice}>₹{otherProduct.price || 0}</p>
                          {otherProduct.featured && (
                            <span className={styles.relatedProductBadge}>⭐ Featured</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={styles.noRelatedProducts}>
            <p>No related products available</p>
          </div>
        )}
      </div>
    </>
  );
}

