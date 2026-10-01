import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { couponService } from '../../services/coupon.service';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from 'react-toastify';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    minimum_order_amount: '0.00',
    maximum_discount: '',
    usage_limit: 100,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getAllCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form };
      if (!payload.maximum_discount) delete payload.maximum_discount;
      await couponService.createCoupon(payload);
      setIsModalOpen(false);
      setForm({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        minimum_order_amount: '0.00',
        maximum_discount: '',
        usage_limit: 100,
        is_active: true,
      });
      await loadCoupons();
      toast.success(`Coupon "${payload.code}" created successfully!`);
    } catch {
      toast.error('Failed to create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      setDeleting(true);
      await couponService.deleteCoupon(couponToDelete.id);
      await loadCoupons();
      toast.info(`Coupon "${couponToDelete.code}" deleted.`);
      setCouponToDelete(null);
    } catch {
      toast.error('Failed to delete coupon.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Coupons & Promotions</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure checkout discount codes, limits, and order thresholds
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Max Cap</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Ticket size={16} color="var(--primary)" />
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{c.code}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value} Flat`}
                  </td>
                  <td>₹{c.minimum_order_amount}</td>
                  <td>{c.maximum_discount ? `₹${c.maximum_discount}` : 'No cap'}</td>
                  <td>{c.times_used} / {c.usage_limit}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {c.is_active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setCouponToDelete(c)}
                      style={{ padding: '0.35rem', color: 'var(--danger)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
        maxWidth="480px"
      >
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FLASH50"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              placeholder="e.g. 50% discount on cart value above ₹499"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Discount Val *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Order (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.minimum_order_amount}
                onChange={(e) => setForm({ ...form, minimum_order_amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Cap (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={form.maximum_discount}
                onChange={(e) => setForm({ ...form, maximum_discount: e.target.value })}
              />
            </div>
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
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Coupon"
        message={`Are you sure you want to permanently delete promotional coupon "${couponToDelete?.code}"? Shoppers will no longer be able to apply this discount.`}
        confirmText="Delete Coupon"
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};
