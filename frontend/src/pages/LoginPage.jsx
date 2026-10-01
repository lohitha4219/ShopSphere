import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, Truck, RotateCcw, ArrowRight,
  UserCheck, Store, Shield, Mail, Lock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShopSphereLogo } from '../components/common/ShopSphereLogo';
import { PasswordInput } from '../components/common/PasswordInput';
import { GoogleAuthButton } from '../components/common/GoogleAuthButton';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(() => location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Field-level inline validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Prefill registered email if redirected from registration
  useEffect(() => {
    if (location.state?.registeredEmail && !identifier) {
      setIdentifier(location.state.registeredEmail);
    }
  }, [location.state?.registeredEmail]);

  const validateIdentifier = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email or mobile number is required';
    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address';
      }
    } else {
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        return 'Mobile number must contain 10 digits';
      }
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    setIdentifier(val);
    if (touched.identifier) {
      setErrors((prev) => ({ ...prev, identifier: validateIdentifier(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'identifier') {
      setErrors((prev) => ({ ...prev, identifier: validateIdentifier(identifier) }));
    }
    if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'SELLER') {
      navigate('/seller/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');

    const idErr = validateIdentifier(identifier);
    const pwdErr = validatePassword(password);
    setTouched({ identifier: true, password: true });
    setErrors({ identifier: idErr, password: pwdErr });

    if (idErr || pwdErr) return;

    setLoading(true);
    try {
      const loggedUser = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${loggedUser.first_name || loggedUser.username || 'User'}!`);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        if (data.account) {
          setApiError(Array.isArray(data.account) ? data.account[0] : data.account);
        } else if (data.status) {
          setApiError(Array.isArray(data.status) ? data.status[0] : data.status);
        } else if (data.credentials) {
          setApiError(Array.isArray(data.credentials) ? data.credentials[0] : data.credentials);
        } else if (data.non_field_errors) {
          setApiError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
        } else if (data.detail) {
          setApiError(data.detail);
        } else if (data.email) {
          setApiError(Array.isArray(data.email) ? data.email[0] : data.email);
        } else {
          setApiError('Invalid email or password.');
        }
      } else {
        setApiError('Unable to connect to authentication server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setApiError('');
    try {
      const loggedUser = await googleLogin(credential);
      toast.success(`Welcome, ${loggedUser.first_name || loggedUser.username || 'Customer'}!`);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      const data = err.response?.data;
      const errorMsg =
        data?.error ||
        data?.status?.[0] ||
        data?.non_field_errors?.[0] ||
        'Unable to verify your Google account. Please try again.';
      setApiError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleGoogleError = (err) => {
    // If user simply closed the popup, silently return to login
    if (err?.message?.includes('closed') || err?.type === 'popup_closed') {
      return;
    }
    toast.error('Google sign-in was unsuccessful. Please try again.');
  };

  // Quick Demo credentials helper for testing
  const fillDemo = (demoId, demoPwd) => {
    setIdentifier(demoId);
    setPassword(demoPwd);
    setErrors({});
    setTouched({});
    setApiError('');
  };

  return (
    <div className="auth-page-wrapper">
      {/* Subtle Background Glow Spheres */}
      <div className="auth-ambient-sphere-1" aria-hidden="true" />
      <div className="auth-ambient-sphere-2" aria-hidden="true" />

      <div
        className="auth-container-grid auth-glass-card"
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.15fr)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* LEFT COLUMN: Brand / Benefits Showcase (Desktop) */}
        <div
          className="auth-brand-sidebar"
          style={{
            background: 'linear-gradient(145deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)',
            color: '#FFFFFF',
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-15%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(35px)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ marginBottom: '2.25rem' }}>
              <ShopSphereLogo size="lg" to="/" showTagline={true} tagline="Everything You Need. Delivered Simply." />
            </div>

            <h1
              style={{
                fontSize: '1.95rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.25,
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Shopping made easy, trusted & fast.
            </h1>
            <p
              style={{
                fontSize: '0.975rem',
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
              }}
            >
              Explore verified brands, doorstep delivery in 24-48 hours, and 100% secure payments backed by 256-bit encryption.
            </p>

            {/* Benefit Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={20} color="#93C5FD" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>100% Genuine Products</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>Direct from verified sellers</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Truck size={20} color="#93C5FD" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Express Pan-India Delivery</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>Live order status & GPS tracking</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <RotateCcw size={20} color="#93C5FD" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>7-Day Easy Returns</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>Instant refund guarantee</div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.78rem',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            © 2026 ShopSphere India &bull; All Rights Reserved
          </div>
        </div>

        {/* RIGHT COLUMN: Glass Login Form */}
        <div
          style={{
            padding: '3.5rem 2.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <div className="auth-mobile-logo" style={{ display: 'none', marginBottom: '1.25rem' }}>
              <ShopSphereLogo size="md" to="/" showTagline={true} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Login to continue to your ShopSphere account
            </p>
          </div>

          {apiError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email or Mobile Field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="login-identifier" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                Email or Mobile Number <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  onBlur={() => handleBlur('identifier')}
                  placeholder="name@example.com or 10-digit mobile"
                  autoComplete="username"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '0.85rem',
                    borderColor: errors.identifier ? 'var(--danger)' : undefined,
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                />
              </div>
              {errors.identifier && (
                <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.identifier}
                </div>
              )}
            </div>

            {/* Password Field with Left Icon & Eye Toggle */}
            <PasswordInput
              id="login-password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              label="Password"
              required={true}
              error={errors.password}
              leftIcon={<Lock size={18} />}
            />

            {/* Forgot Password Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span style={{ padding: '0 0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Real Google OAuth Button */}
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={loading}
            text="Continue with Google"
          />

          {/* Create Account Link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>

          {/* Quick Demo Switcher for Evaluation */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '0.85rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-strong)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quick Demo Accounts (1-Click)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fillDemo('customer@shopsphere.local', 'ShopSphere@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                <UserCheck size={13} />
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('seller@shopsphere.local', 'ShopSphere@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                <Store size={13} />
                Seller
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@shopsphere.local', 'ShopSphere@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                <Shield size={13} />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Layout CSS */}
      <style>{`
        @media (max-width: 820px) {
          .auth-container-grid {
            grid-template-columns: 1fr !important;
            max-width: 420px !important;
          }
          .auth-brand-sidebar {
            display: none !important;
          }
          .auth-mobile-logo {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
