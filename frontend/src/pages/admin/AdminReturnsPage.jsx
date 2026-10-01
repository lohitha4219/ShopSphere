import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Search, MessageSquare, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Modal } from '../../components/common/Modal';
import { toast } from 'react-toastify';

export const AdminReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModal, setActionModal] = useState({ open: false, type: 'approve', returnItem: null, notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAdminReturns();
      setReturns(data || []);
    } catch (err) {
      console.error('Failed to load returns:', err);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModal.returnItem) return;
    setSubmitting(true);
    try {
      if (actionModal.type === 'approve') {
        await orderService.approveReturn(actionModal.returnItem.id, actionModal.notes);
        toast.success('Return request approved & refund initiated');
      } else {
        await orderService.rejectReturn(actionModal.returnItem.id, actionModal.notes);
        toast.info('Return request rejected');
      }
      setActionModal({ open: false, type: 'approve', returnItem: null, notes: '' });
      loadReturns();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const term = searchTerm.toLowerCase();
    const orderId = (r.order_id_display || r.order || '').toString().toLowerCase();
    const customer = (r.customer_name || '').toLowerCase();
    const reason = (r.reason || '').toLowerCase();
    return orderId.includes(term) || customer.includes(term) || reason.includes(term);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Return & Refund Requests</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Process customer dispute claims, returns, and issue refunds
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search return by order, user, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingBlock: '0.45rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Return Reason</th>
              <th>Customer Notes</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Admin Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading return requests...
                </td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  No pending return or refund requests.
                </td>
              </tr>
            ) : (
              filteredReturns.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {item.order_id_display || `#${item.order}`}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.customer_name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.customer_email}</div>
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ fontWeight: 600 }}>
                      {item.reason}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.comments || 'No comment provided'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === 'Approved'
                          ? 'badge-success'
                          : item.status === 'Rejected'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {item.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setActionModal({ open: true, type: 'approve', returnItem: item, notes: '' })}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                        >
                          <CheckCircle size={14} style={{ marginRight: '0.2rem' }} /> Approve
                        </button>
                        <button
                          onClick={() => setActionModal({ open: true, type: 'reject', returnItem: item, notes: '' })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                        >
                          <XCircle size={14} style={{ marginRight: '0.2rem' }} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.admin_notes ? `Notes: ${item.admin_notes}` : 'Completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {actionModal.open && (
        <Modal
          isOpen={actionModal.open}
          onClose={() => setActionModal({ open: false, type: 'approve', returnItem: null, notes: '' })}
          title={actionModal.type === 'approve' ? 'Approve Return & Refund' : 'Reject Return Request'}
        >
          <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface-sunken)', fontSize: '0.875rem' }}>
              <strong>Order:</strong> {actionModal.returnItem?.order_id_display || `#${actionModal.returnItem?.order}`}
              <br />
              <strong>Reason:</strong> {actionModal.returnItem?.reason}
              <br />
              <strong>Customer note:</strong> {actionModal.returnItem?.comments || 'None'}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Admin Feedback / Notes
              </label>
              <textarea
                rows="3"
                value={actionModal.notes}
                onChange={(e) => setActionModal({ ...actionModal, notes: e.target.value })}
                placeholder="Optional explanation for customer notifications..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActionModal({ open: false, type: 'approve', returnItem: null, notes: '' })}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  backgroundColor: actionModal.type === 'approve' ? '#10b981' : '#ef4444',
                  borderColor: actionModal.type === 'approve' ? '#10b981' : '#ef4444',
                }}
              >
                {submitting ? 'Processing...' : actionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
