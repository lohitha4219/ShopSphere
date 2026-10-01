import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, ShoppingBag } from 'lucide-react';
import { productService } from '../../services/product.service';
import { ProductImage } from '../../components/common/ProductImage';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from 'react-toastify';

export const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ seller_only: 'true' });
      setProducts(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerProducts();
  }, []);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete.id);
      await loadSellerProducts();
      toast.success(`"${productToDelete.name}" removed from catalog`);
      setProductToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productService.updateProduct(product.id, { is_active: !product.is_active });
      await loadSellerProducts();
      toast.success(`Product is now ${!product.is_active ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Failed to update product status.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Product Inventory</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage pricing, stocks, and live status of your store items
          </p>
        </div>
        <Link to="/seller/products/new" className="btn btn-primary">
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading product catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  No products added yet. Click "Add Product" to get started.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
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
                        <div style={{ fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku}</td>
                  <td>{p.category_name}</td>
                  <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                  <td>{p.discount_percentage}%</td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock_quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle active"
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link
                        to={`/products/${p.slug || p.id}`}
                        style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                        title="View Public Page"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/seller/products/${p.id}/edit`}
                        style={{ padding: '0.35rem', color: 'var(--primary)' }}
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => setProductToDelete(p)}
                        style={{ padding: '0.35rem', color: 'var(--danger)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                        title="Delete Product"
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
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};
