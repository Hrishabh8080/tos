'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import styles from './Products.module.css';
import API_URL from '../../config/api';
import { useToast } from '@/components/Toast/ToastContainer';

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPriceQuoteModal, setShowPriceQuoteModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setMobileNumber('');
    setRequestSent(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setMobileNumber('');
    setRequestSent(false);
  };

  const handleContactRequest = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSendingRequest(true);

    try {
      const response = await fetch(`${API_URL}/api/contact-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: selectedProduct.name,
          productId: selectedProduct._id,
          mobileNumber: mobileNumber,
          category: selectedProduct.category?.name,
          price: selectedProduct.price,
        }),
      });

      if (response.ok) {
        setRequestSent(true);
        toast.success('Thank you! We will contact you within 24-48 hours.');
        setMobileNumber('');
      } else {
        toast.error('Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending contact request:', error);
      toast.error('Unable to send request. Please check your connection and try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchTerm, products]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/categories`),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category._id === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const getProductsByCategory = (categoryId) => {
    return filteredProducts.filter((product) => product.category?._id === categoryId);
  };

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
          <video autoPlay loop muted playsInline className={styles.heroVideo}>
            <source src="https://www.pexels.com/download/video/3209211/" type="video/mp4" />
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
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchBtn}>Search</button>
        </div>

        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              className={`${styles.categoryBtn} ${selectedCategory === category._id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid by Category */}
      {selectedCategory === 'all' ? (
        // Show products grouped by category
        <div className={styles.mainContent}>
          {categories.map((category) => {
            const categoryProducts = getProductsByCategory(category._id);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={category._id} className={styles.categorySection}>
                <div className={styles.categorySectionHeader}>
                  <div>
                    <h2>{category.name}</h2>
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
                  {categoryProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} onViewDetails={openProductDetails} />
                  ))}
                </div>
              </section>
            );
          })}
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
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onViewDetails={openProductDetails} />
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

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            
            <div className={styles.modalBody}>
              <div className={styles.modalImages}>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div className={styles.imageGallery}>
                    <img 
                      src={selectedProduct.images[0].url} 
                      alt={selectedProduct.name}
                      className={styles.mainImage}
                    />
                    {selectedProduct.images.length > 1 && (
                      <div className={styles.thumbnails}>
                        {selectedProduct.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            className={styles.thumbnail}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.noImageLarge}>No Image Available</div>
                )}
              </div>

              <div className={styles.modalInfo}>
                {selectedProduct.featured && (
                  <div className={styles.featuredBadgeLarge}>⭐ Featured Product</div>
                )}
                <div className={styles.categoryTagLarge}>{selectedProduct.category?.name}</div>
                <h2>{selectedProduct.name}</h2>
                <div className={styles.priceLarge}>Approx. Price: ₹{selectedProduct.price}</div>
                <button 
                  className={styles.getLatestPriceBtn}
                  onClick={() => setShowPriceQuoteModal(true)}
                >
                  Get Latest Price
                </button>

                <div className={styles.descriptionSection}>
                  <h3>Description</h3>
                  <p>{selectedProduct.description}</p>
                </div>

                {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                  <div className={styles.specificationsSection}>
                    <h3>Specifications</h3>
                    <div className={styles.specGrid}>
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        value && (
                          <div key={key} className={styles.specRow}>
                            <span className={styles.specLabel}>{key}:</span>
                            <span className={styles.specValueLarge}>{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button className={styles.closeModalBtn} onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Quote Modal */}
      {showPriceQuoteModal && selectedProduct && (
        <div className={styles.priceQuoteOverlay} onClick={() => setShowPriceQuoteModal(false)}>
          <div className={styles.priceQuoteModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowPriceQuoteModal(false)}>✕</button>
            <h3>Get Latest Price</h3>
            <div className={styles.quoteProductInfo}>
              <p className={styles.quoteProductName}>{selectedProduct.name}</p>
              <p className={styles.quoteApproxPrice}>Approx. Price: ₹{selectedProduct.price}</p>
            </div>
            <div className={styles.quoteForm}>
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength="15"
                className={styles.quoteMobileInput}
              />
              <button 
                className={styles.quoteSubmitBtn} 
                onClick={handleContactRequest}
                disabled={sendingRequest || requestSent}
              >
                {sendingRequest ? 'Sending...' : requestSent ? '✓ Request Sent' : 'Request Callback'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

function ProductCard({ product, onViewDetails }) {
  return (
    <div className={styles.productCard}>
      {product.featured && <div className={styles.featuredBadge}>Featured</div>}
      <div className={styles.imageContainer} onClick={() => onViewDetails(product)}>
        {product.images && product.images[0] ? (
          <img src={product.images[0].url} alt={product.name} />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
      </div>
      <div className={styles.productInfo}>
        <div className={styles.categoryTag}>{product.category?.name}</div>
        <h3 onClick={() => onViewDetails(product)} style={{ cursor: 'pointer' }}>{product.name}</h3>
        <p className={styles.description}>
          {product.description.length > 100
            ? product.description.substring(0, 100) + '...'
            : product.description}
        </p>
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className={styles.specifications}>
            {Object.entries(product.specifications)
              .slice(0, 2)
              .map(([key, value]) => (
                value && (
                  <div key={key} className={styles.specItem}>
                    <span className={styles.specKey}>{key}:</span>
                    <span className={styles.specValue}>{value}</span>
                  </div>
                )
              ))}
          </div>
        )}
        <div className={styles.productFooter}>
          <div className={styles.price}>Approx. Price: ₹{product.price}</div>
          <button className={styles.viewBtn} onClick={() => onViewDetails(product)}>View Details</button>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <div className={styles.lowStock}>Only {product.stock} left!</div>
        )}
      </div>
    </div>
  );
}
