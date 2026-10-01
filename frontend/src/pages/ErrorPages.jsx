import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ServerCrash, Home, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Logo size="lg" />
      </div>

      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <AlertTriangle size={36} />
      </div>

      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        Error 404
      </span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
        Oops! We couldn't find that page.
      </h1>
      <p style={{ maxWidth: '440px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px' }}>
        The link you followed may be broken, or the page may have been removed. Let's get you back on track to your shopping.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', textDecoration: 'none' }}
        >
          <Home size={16} />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
};

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Logo size="lg" />
      </div>

      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'var(--danger-bg)',
        color: 'var(--danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <ShieldAlert size={36} />
      </div>

      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        Error 403 &bull; Unauthorized Access
      </span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
        Access Restricted
      </h1>
      <p style={{ maxWidth: '440px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px' }}>
        You don't have the required administrative or seller privileges to view this portal.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/login"
          className="btn btn-secondary"
          style={{ borderRadius: '8px', textDecoration: 'none' }}
        >
          Switch Account
        </Link>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', textDecoration: 'none' }}
        >
          <Home size={16} />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
};

export const ServerErrorPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Logo size="lg" />
      </div>

      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'var(--warning-bg)',
        color: 'var(--warning)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <ServerCrash size={36} />
      </div>

      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        Error 500 &bull; Server Encountered an Issue
      </span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
        Temporary System Glitch
      </h1>
      <p style={{ maxWidth: '440px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px' }}>
        Our systems are currently experiencing unexpected load or maintenance. Please try refreshing in a moment.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-secondary"
          style={{ borderRadius: '8px' }}
        >
          Refresh Page
        </button>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', textDecoration: 'none' }}
        >
          <Home size={16} />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
};
