import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Trash2, Eye, ShoppingBag } from 'lucide-react';
import { productService } from '../../services/product.service';
import { ProductImage } from '../../components/common/ProductImage';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from 'react-toastify';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ admin_view: 'true' });
      setProducts(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  const handleToggleActive = async (p) => {
    try {
      await productService.updateProduct(p.id, { is_active: !p.is_active });
      await loadAllProducts();
      toast.success(`"${p.name}" is now ${!p.is_active ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Failed to update product status.');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete.id);
      await loadAllProducts();
      toast.success(`"${productToDelete.name}" removed from marketplace`);
      setProductToDelete(null);
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Product Catalog Moderation</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage all products across all sellers in the marketplace
        </p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ProductImage
                          src={p.thumbnail || p.primary_image}
                          alt={p.name}
                          fallbackType="product"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.seller_name || 'Official'}</td>
                  <td>{p.category_name}</td>
                  <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.rating}★ ({p.review_count})</td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/products/${p.slug || p.id}`} style={{ padding: '0.35rem', color: 'var(--text-muted)' }} title="View">
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => setProductToDelete(p)}
                        style={{ padding: '0.35rem', color: 'var(--danger)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? It will be removed from all customer searches and categories.`}
        confirmText="Delete"
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};
