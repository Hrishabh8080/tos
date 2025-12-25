'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import API_URL from '../../../config/api';
import { useToast } from '@/components/Toast/ToastContainer';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';

export default function AdminDashboard() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
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
    // Check authentication - only run once
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.replace('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      await fetchData();
    };
    checkAuth();
  }, []); // Remove router from dependency array

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/categories/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        console.error('Failed to fetch data');
        if (productsRes.status === 401 || categoriesRes.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          router.replace('/admin/login');
          return;
        }
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.replace('/admin/login');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();

    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('stock', productForm.stock);
    formData.append('featured', productForm.featured);
    formData.append('specifications', JSON.stringify(productForm.specifications));

    productImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct._id}`
        : `${API_URL}/api/products`;

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowProductForm(false);
        setEditingProduct(null);
        resetProductForm();
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || 'Failed to save product. Please try again.';
        console.error('Server error response:', errorData);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Unable to save product. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();

    formData.append('name', categoryForm.name);
    formData.append('description', categoryForm.description);
    if (categoryImage) {
      formData.append('image', categoryImage);
    }

    try {
      const url = editingCategory
        ? `${API_URL}/api/categories/${editingCategory._id}`
        : `${API_URL}/api/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setShowCategoryForm(false);
        setEditingCategory(null);
        resetCategoryForm();
        fetchData();
      } else {
        toast.error('Failed to save category. Please try again.');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Unable to save category. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => confirmDeleteProduct(id)
    });
  };

  const confirmDeleteProduct = async (id) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setDeleting(id);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        fetchData();
      } else {
        toast.error('Failed to delete product. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Unable to delete product. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const deleteCategory = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => confirmDeleteCategory(id)
    });
  };

  const confirmDeleteCategory = async (id) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setDeleting(id);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Category deleted successfully!');
        fetchData();
      } else {
        toast.error('Failed to delete category. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Unable to delete category. Please try again.');
    } finally {
      setDeleting(null);
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

  if (!isAuthenticated || loading) {
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
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
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
                    
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      step="0.01"
                      min="0"
                    />
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
                      <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
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
              {products.map((product) => (
                <div key={product._id} className={styles.card}>
                  {product.images && product.images[0] && (
                    <img src={product.images[0].url} alt={product.name} className={styles.cardImage} />
                  )}
                  <div className={styles.cardContent}>
                    <h3>{product.name}</h3>
                    <p className={styles.category}>{product.category?.name}</p>
                    <p className={styles.price}>Approx. Price: ₹{product.price}</p>
                    {product.featured && <span className={styles.badge}>Featured</span>}
                    <div className={styles.cardActions}>
                      <button onClick={() => editProduct(product)} className={styles.editBtn} disabled={deleting === product._id}>
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(product._id)} className={styles.deleteBtn} disabled={deleting === product._id}>
                        {deleting === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                      <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? 'Saving...' : `${editingCategory ? 'Update' : 'Create'} Category`}
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
                      <button onClick={() => editCategory(category)} className={styles.editBtn} disabled={deleting === category._id}>
                        Edit
                      </button>
                      <button onClick={() => deleteCategory(category._id)} className={styles.deleteBtn} disabled={deleting === category._id}>
                        {deleting === category._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
