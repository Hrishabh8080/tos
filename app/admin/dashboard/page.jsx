'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    minOrderQuantity: '',
    featured: false,
    specifications: {},
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [productImages, setProductImages] = useState([]);
  const [categoryImage, setCategoryImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router]);

  // Filter products based on search term and category filter
  useEffect(() => {
    let filtered = products;

    // Filter by category first
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(
        (product) => product.category && product.category._id === selectedCategoryFilter
      );
    }

    // Then filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
        const categoryMatch = product.category?.name?.toLowerCase().includes(searchLower);
        const priceMatch = product.price?.toString().includes(searchTerm);
        const stockMatch = product.stock?.toString().includes(searchTerm);
        
        // Search in specifications
        let specMatch = false;
        if (product.specifications) {
          const specValues = Object.values(product.specifications).join(' ').toLowerCase();
          specMatch = specValues.includes(searchLower);
        }

        return nameMatch || descriptionMatch || categoryMatch || priceMatch || stockMatch || specMatch;
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategoryFilter, products]);

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/categories/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Check if response is JSON before parsing
      const productsContentType = productsRes.headers.get('content-type');
      const categoriesContentType = categoriesRes.headers.get('content-type');

      // Handle products response
      if (productsRes.ok && productsContentType?.includes('application/json')) {
        const productsData = await productsRes.json();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        console.warn(`Failed to fetch products: ${productsRes.status} ${productsRes.statusText}`);
        setProducts([]);
        setFilteredProducts([]);
      }

      // Handle categories response
      if (categoriesRes.ok && categoriesContentType?.includes('application/json')) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } else {
        console.warn(`Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error to prevent crashes
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();

    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('stock', productForm.stock);
    formData.append('minOrderQuantity', productForm.minOrderQuantity);
    formData.append('featured', productForm.featured);
    formData.append('specifications', JSON.stringify(productForm.specifications));

    productImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowProductForm(false);
        setEditingProduct(null);
        resetProductForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();

    formData.append('name', categoryForm.name);
    formData.append('description', categoryForm.description);
    if (categoryImage) {
      formData.append('image', categoryImage);
    }

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setShowCategoryForm(false);
        setEditingCategory(null);
        resetCategoryForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Category deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category._id,
      stock: product.stock,
      minOrderQuantity: product.minOrderQuantity || 1,
      featured: product.featured,
      specifications: product.specifications || {},
    });
    setShowProductForm(true);
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
    });
    setShowCategoryForm(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      minOrderQuantity: '',
      featured: false,
      specifications: {},
    });
    setProductImages([]);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
    });
    setCategoryImage(null);
  };

  const addSpecification = () => {
    const key = prompt('Enter specification name:');
    const value = prompt('Enter specification value:');
    if (key && value) {
      setProductForm({
        ...productForm,
        specifications: { ...productForm.specifications, [key]: value },
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <nav className={styles.navbar}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </nav>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveTab('products');
            setSearchTerm(''); // Clear search when switching tabs
            setSelectedCategoryFilter('all'); // Clear category filter when switching tabs
          }}
        >
          Products ({searchTerm || selectedCategoryFilter !== 'all' ? filteredProducts.length : products.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({categories.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'products' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Products Management</h2>
              <button
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className={styles.addBtn}
              >
                + Add Product
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className={styles.searchFilterContainer}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search products by name, description, price, stock..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={styles.clearSearchBtn}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className={styles.filterContainer}>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className={styles.categoryFilter}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategoryFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={styles.clearFilterBtn}
                    title="Clear category filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search/Filter Results Info */}
            {(searchTerm || selectedCategoryFilter !== 'all') && (
              <div className={styles.searchInfo}>
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                {selectedCategoryFilter !== 'all' && (
                  <> in category "{categories.find(c => c._id === selectedCategoryFilter)?.name}"</>
                )}
                {searchTerm && (
                  <> matching "{searchTerm}"</>
                )}
              </div>
            )}

            {showProductForm && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <form onSubmit={handleProductSubmit} className={styles.form}>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Product Description (Detailed description of the product)"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                      rows="4"
                    />
                    
                    <div className={styles.formRow}>
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        step="0.01"
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="Minimum Order Quantity (Min units customer must buy)"
                        value={productForm.minOrderQuantity || ''}
                        onChange={(e) => setProductForm({ ...productForm, minOrderQuantity: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                    {categories.length === 0 ? (
                      <div className={styles.noCategoryWarning}>
                        ⚠️ No categories available! Please create a category first.
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setActiveTab('categories');
                            setShowCategoryForm(true);
                          }}
                          className={styles.createCategoryBtn}
                        >
                          Create Category Now
                        </button>
                      </div>
                    ) : (
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <div className={styles.productDetails}>
                      <h4>Product Details</h4>
                      <div className={styles.formRow}>
                        <input
                          type="text"
                          placeholder="Brand (e.g., Apple, Samsung)"
                          value={productForm.specifications?.Brand || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Brand: e.target.value }
                          })}
                        />
                        <input
                          type="text"
                          placeholder="Model Number"
                          value={productForm.specifications?.Model || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Model: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <input
                          type="text"
                          placeholder="Color (e.g., Black, White)"
                          value={productForm.specifications?.Color || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Color: e.target.value }
                          })}
                        />
                        <input
                          type="text"
                          placeholder="Material (e.g., Wood, Metal)"
                          value={productForm.specifications?.Material || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Material: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <input
                          type="text"
                          placeholder="Size (e.g., Large, Medium, Small)"
                          value={productForm.specifications?.Size || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Size: e.target.value }
                          })}
                        />
                        <input
                          type="text"
                          placeholder="Usage (e.g., Indoor, Outdoor, Commercial)"
                          value={productForm.specifications?.Usage || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Usage: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <input
                          type="text"
                          placeholder="Weight (e.g., 50 lbs)"
                          value={productForm.specifications?.Weight || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Weight: e.target.value }
                          })}
                        />
                        <input
                          type="text"
                          placeholder="Length (e.g., 60 inches)"
                          value={productForm.specifications?.Length || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specifications: { ...productForm.specifications, Length: e.target.value }
                          })}
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Warranty (e.g., 1 Year Manufacturer Warranty)"
                        value={productForm.specifications?.Warranty || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specifications: { ...productForm.specifications, Warranty: e.target.value }
                        })}
                      />
                    </div>

                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      />
                      Featured Product
                    </label>

                    <div className={styles.specifications}>
                      <label>Specifications:</label>
                      <button type="button" onClick={addSpecification} className={styles.addSpecBtn}>
                        + Add Specification
                      </button>
                      <div className={styles.specList}>
                        {Object.entries(productForm.specifications).map(([key, value]) => (
                          <div key={key} className={styles.specItem}>
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setProductImages(Array.from(e.target.files))}
                    />

                    <div className={styles.formActions}>
                      <button type="submit" className={styles.submitBtn}>
                        {editingProduct ? 'Update' : 'Create'} Product
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          resetProductForm();
                        }}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className={styles.grid}>
              {filteredProducts.length === 0 ? (
                <div className={styles.noResults}>
                  {searchTerm || selectedCategoryFilter !== 'all' ? (
                    <>
                      <p>
                        No products found
                        {selectedCategoryFilter !== 'all' && ` in category "${categories.find(c => c._id === selectedCategoryFilter)?.name}"`}
                        {searchTerm && ` matching "${searchTerm}"`}
                      </p>
                      <div className={styles.clearFiltersContainer}>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className={styles.clearFilterBtn}
                          >
                            Clear Search
                          </button>
                        )}
                        {selectedCategoryFilter !== 'all' && (
                          <button
                            onClick={() => setSelectedCategoryFilter('all')}
                            className={styles.clearFilterBtn}
                          >
                            Clear Category Filter
                          </button>
                        )}
                        {(searchTerm || selectedCategoryFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategoryFilter('all');
                            }}
                            className={styles.clearAllBtn}
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p>No products available. Click "+ Add Product" to create one.</p>
                  )}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id} className={styles.card}>
                    {product.images && product.images[0] && (
                      <img src={product.images[0].url} alt={product.name} className={styles.cardImage} />
                    )}
                    <div className={styles.cardContent}>
                      <h3>{product.name}</h3>
                      <p className={styles.category}>{product.category?.name}</p>
                      <p className={styles.price}>${product.price}</p>
                      <p className={styles.stock}>Stock: {product.stock}</p>
                      {product.featured && <span className={styles.badge}>Featured</span>}
                      <div className={styles.cardActions}>
                        <button onClick={() => editProduct(product)} className={styles.editBtn}>
                          Edit
                        </button>
                        <button onClick={() => deleteProduct(product._id)} className={styles.deleteBtn}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Categories Management</h2>
              <button
                onClick={() => {
                  setShowCategoryForm(true);
                  setEditingCategory(null);
                  resetCategoryForm();
                }}
                className={styles.addBtn}
              >
                + Add Category
              </button>
            </div>

            {showCategoryForm && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                  <form onSubmit={handleCategorySubmit} className={styles.form}>
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      rows="4"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCategoryImage(e.target.files[0])}
                    />
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.submitBtn}>
                        {editingCategory ? 'Update' : 'Create'} Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryForm(false);
                          setEditingCategory(null);
                          resetCategoryForm();
                        }}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className={styles.grid}>
              {categories.map((category) => (
                <div key={category._id} className={styles.card}>
                  {category.image && (
                    <img src={category.image.url} alt={category.name} className={styles.cardImage} />
                  )}
                  <div className={styles.cardContent}>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <div className={styles.cardActions}>
                      <button onClick={() => editCategory(category)} className={styles.editBtn}>
                        Edit
                      </button>
                      <button onClick={() => deleteCategory(category._id)} className={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
