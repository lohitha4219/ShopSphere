import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export const LogoutModal = ({ isOpen, onClose, redirectPath = '/login' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      setSubmitting(true);
      await logout();
      onClose();
      toast.success('Logged out successfully.');
      // Replace history state to prevent back navigation into protected pages
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      onClose();
      navigate(redirectPath, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card auth-glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          border: '1px solid var(--border-subtle)',
          animation: 'scaleIn 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <X size={18} />
        </button>

        {/* Icon Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LogOut size={22} />
          </div>
          <div>
            <h3 id="logout-dialog-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Are you sure you want to logout?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              ShopSphere Session
            </p>
          </div>
        </div>

        {/* Prompt Body */}
        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.75rem' }}>
          You will be logged out of your ShopSphere account. Your cart and saved wishlist items will remain safe and available the next time you sign in.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={submitting}
            className="btn btn-danger"
            style={{ minWidth: '110px' }}
          >
            {submitting ? 'Signing out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
