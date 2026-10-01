import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { sellerService } from '../services/seller.service';
import { useAuth } from '../context/AuthContext';

export const SellerRegisterPage = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: '',
    owner_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    business_address: '',
    gst_number: '',
    pan_number: '',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await sellerService.registerSeller(form);
      await refreshProfile();
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.business_name?.[0] ||
        'Failed to submit seller application.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ marginTop: '4rem', maxWidth: '600px' }}>
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Application Under Review
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Thank you for registering <strong>{form.business_name}</strong>! Your application is in <strong>Pending</strong> status. An administrator will review your GST & tax documents shortly.
          </p>

          <button
            onClick={() => navigate('/seller/dashboard')}
            className="btn btn-primary"
          >
            Go to Seller Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2.5rem', maxWidth: '780px' }}>
      <div
        className="card"
        style={{
          padding: '2.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Become a Verified Seller</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sell your products to millions of shoppers with 0% launch commission
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
            Business & Store Details
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Store / Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Electronics Hub"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Proprietor / Owner Name *</label>
              <input
                type="text"
                required
                placeholder="Owner legal name"
                value={form.owner_name}
                onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Business Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registered Business Address *</label>
            <textarea
              rows={2}
              required
              placeholder="Full warehouse or office address with city and state"
              value={form.business_address}
              onChange={(e) => setForm({ ...form, business_address: e.target.value })}
            />
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
            Tax & Banking Information
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">GSTIN Number</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={form.gst_number}
                onChange={(e) => setForm({ ...form, gst_number: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                placeholder="ABCDE1234F"
                value={form.pan_number}
                onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Account Number</label>
              <input
                type="text"
                placeholder="Account number"
                value={form.bank_account_number}
                onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                type="text"
                placeholder="HDFC0001234"
                value={form.bank_ifsc}
                onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-lg"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting Application...' : 'Submit Seller Application'}
          </button>
        </form>
      </div>
    </div>
  );
};
