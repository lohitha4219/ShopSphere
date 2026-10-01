import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Grid } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from 'react-toastify';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await categoryService.createCategory({
        name,
        parent: parentId || null,
        order: parseInt(order, 10) || 0,
      });
      setName('');
      setParentId('');
      setIsModalOpen(false);
      await loadCategories();
      toast.success(`Category "${name}" created successfully!`);
    } catch {
      toast.error('Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await categoryService.deleteCategory(categoryToDelete.slug || categoryToDelete.id);
      await loadCategories();
      toast.info(`Category "${categoryToDelete.name}" deleted.`);
      setCategoryToDelete(null);
    } catch {
      toast.error('Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Categories Catalog</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Organize departments, parent categories, and subcategories
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div>Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="card"
              style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Grid size={18} color="var(--primary)" />
                  <strong style={{ fontSize: '1.1rem' }}>{cat.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  style={{ color: 'var(--danger)', padding: '0.35rem' }}
                  title="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Subcategories ({cat.subcategories?.length || 0}):
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.subcategories?.map((sub) => (
                  <span
                    key={sub.id}
                    className="badge badge-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Category"
        maxWidth="450px"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Watches"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category (Optional for subcategory)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (Top-Level Category)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sort Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Any linked subcategories or products will be affected.`}
        confirmText="Delete Category"
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};
