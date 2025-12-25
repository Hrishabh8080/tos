'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../../components/Header/Header';
import styles from './CategoryProducts.module.css';
import API_URL from '../../../../config/api';
import { useToast } from '@/components/Toast/ToastContainer';

export default function CategoryProductsPage() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    fetchCategoryProducts();
  }, [params.slug]);

  const fetchCategoryProducts = async () => {
    try {
      // First, get all categories to find the one matching the slug
      const categoriesRes = await fetch(`${API_URL}/api/categories`);
      const categories = await categoriesRes.json();
      
      const foundCategory = categories.find(cat => 
        cat.name.toLowerCase().replace(/\s+/g, '-') === params.slug
      );

      if (!foundCategory) {
        toast.error('Category not found');
        router.push('/products');
        return;
      }

      setCategory(foundCategory);

      // Fetch products for this category
      const productsRes = await fetch(`${API_URL}/api/products?category=${foundCategory._id}`);
      const productsData = await productsRes.json();
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

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
          <div className={styles.heroContent}>
            <button onClick={() => router.push('/products')} className={styles.backBtn}>
              ← Back to All Products
            </button>
            <h1>{category?.name}</h1>
            {category?.description && <p>{category.description}</p>}
          </div>
        </section>

        {/* Products Section */}
        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2>{products.length} Product{products.length !== 1 ? 's' : ''} Available</h2>
          </div>

          {products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <div key={product._id} className={styles.productCard}>
                  {product.featured && (
                    <span className={styles.featuredBadge}>Featured</span>
                  )}
                  
                  <div className={styles.productImage}>
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>

                  <div className={styles.productInfo}>
                    <span className={styles.categoryBadge}>
                      {product.category?.name}
                    </span>
                    <h3>{product.name}</h3>
                    <p className={styles.description}>{product.description}</p>

                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                      <div className={styles.specs}>
                        {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                          <div key={key} className={styles.specItem}>
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.priceSection}>
                      <p className={styles.price}>Approx. Price: ₹{product.price}</p>
                      <button
                        onClick={() => openProductDetails(product)}
                        className={styles.detailsBtn}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noProducts}>
              <p>No products available in this category</p>
            </div>
          )}
        </section>

        {/* Product Details Modal */}
        {showModal && selectedProduct && (
          <div className={styles.modal} onClick={closeModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
              
              <div className={styles.modalBody}>
                <div className={styles.modalImageSection}>
                  <img
                    src={selectedProduct.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={selectedProduct.name}
                    className={styles.modalImage}
                  />
                </div>

                <div className={styles.modalDetails}>
                  <span className={styles.categoryBadge}>
                    {selectedProduct.category?.name}
                  </span>
                  <h2>{selectedProduct.name}</h2>
                  <p className={styles.modalDescription}>{selectedProduct.description}</p>

                  <div className={styles.modalPrice}>
                    <span>Approx. Price:</span>
                    <strong>₹{selectedProduct.price}</strong>
                  </div>

                  {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                    <div className={styles.modalSpecs}>
                      <h3>Specifications:</h3>
                      <div className={styles.specsGrid}>
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key} className={styles.specRow}>
                            <span className={styles.specKey}>{key}:</span>
                            <span className={styles.specValue}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!requestSent ? (
                    <div className={styles.contactForm}>
                      <h3>Interested in this product?</h3>
                      <p>Enter your mobile number and we'll contact you within 24-48 hours</p>
                      <div className={styles.inputGroup}>
                        <input
                          type="tel"
                          placeholder="Enter your 10-digit mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength="10"
                          className={styles.mobileInput}
                        />
                        <button
                          onClick={handleContactRequest}
                          disabled={sendingRequest || mobileNumber.length < 10}
                          className={styles.submitBtn}
                        >
                          {sendingRequest ? 'Sending...' : 'Submit Request'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.successMessage}>
                      <div className={styles.successIcon}>✓</div>
                      <h3>Request Sent Successfully!</h3>
                      <p>We will contact you within 24-48 hours.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
