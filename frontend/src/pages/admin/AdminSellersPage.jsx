import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { sellerService } from '../../services/seller.service';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from 'react-toastify';

export const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerToSuspend, setSellerToSuspend] = useState(null);
  const [suspending, setSuspending] = useState(false);
  const [sellerToReject, setSellerToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Incomplete business documentation');
  const [rejecting, setRejecting] = useState(false);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getAdminSellers();
      setSellers(data || []);
    } catch (err) {
      console.error('Failed to load sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await sellerService.approveSeller(id);
      await loadSellers();
      toast.success('Seller approved successfully!');
    } catch {
      toast.error('Failed to approve seller.');
    }
  };

  const confirmReject = async (e) => {
    e.preventDefault();
    if (!sellerToReject) return;
    try {
      setRejecting(true);
      await sellerService.rejectSeller(sellerToReject.id, rejectReason);
      await loadSellers();
      toast.info('Seller onboarding application rejected.');
      setSellerToReject(null);
    } catch {
      toast.error('Failed to reject seller.');
    } finally {
      setRejecting(false);
    }
  };

  const confirmSuspend = async () => {
    if (!sellerToSuspend) return;
    try {
      setSuspending(true);
      await sellerService.suspendSeller(sellerToSuspend.id);
      await loadSellers();
      toast.warning('Seller account suspended.');
      setSellerToSuspend(null);
    } catch {
      toast.error('Failed to suspend seller.');
    } finally {
      setSuspending(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Seller Applications & Approvals</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Review merchant documents, tax credentials, and manage seller statuses
        </p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner & Contact</th>
              <th>Tax Info</th>
              <th>Bank Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading seller applications...
                </td>
              </tr>
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  No seller applications submitted.
                </td>
              </tr>
            ) : (
              sellers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.business_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.business_address}</div>
                  </td>
                  <td>
                    <div>{s.owner_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>GST: <strong>{s.gst_number || 'N/A'}</strong></div>
                    <div style={{ fontSize: '0.8rem' }}>PAN: <strong>{s.pan_number || 'N/A'}</strong></div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{s.bank_name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.bank_account_number || ''}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        s.status === 'APPROVED'
                          ? 'badge-success'
                          : s.status === 'PENDING'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {s.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(s.id)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                          >
                            <CheckCircle size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => setSellerToReject(s)}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </>
                      )}

                      {s.status === 'APPROVED' && (
                        <button
                          onClick={() => setSellerToSuspend(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', color: 'var(--danger)' }}
                        >
                          <ShieldAlert size={13} />
                          Suspend
                        </button>
                      )}

                      {(s.status === 'REJECTED' || s.status === 'SUSPENDED') && (
                        <button
                          onClick={() => handleApprove(s.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                        >
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={!!sellerToReject}
        onClose={() => setSellerToReject(null)}
        title="Reject Seller Application"
        maxWidth="460px"
      >
        <form onSubmit={confirmReject}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Enter the reason for rejecting store <strong>{sellerToReject?.business_name}</strong>:
          </p>
          <div style={{ marginBottom: '20px' }}>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSellerToReject(null)}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejecting}
              className="btn btn-danger btn-sm"
              style={{ borderRadius: '8px' }}
            >
              {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Suspend Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sellerToSuspend}
        onClose={() => setSellerToSuspend(null)}
        onConfirm={confirmSuspend}
        title="Suspend Seller"
        message={`Are you sure you want to suspend seller "${sellerToSuspend?.business_name}"? Their products will be hidden from all marketplace shoppers immediately.`}
        confirmText="Suspend Account"
        isDanger={true}
        loading={suspending}
      />
    </div>
  );
};
