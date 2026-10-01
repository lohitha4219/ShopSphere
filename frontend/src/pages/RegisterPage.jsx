import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Truck, RotateCcw, ArrowRight,
  User, Mail, Phone, Lock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShopSphereLogo } from '../components/common/ShopSphereLogo';
import { PasswordInput, calculatePasswordStrength } from '../components/common/PasswordInput';
import { toast } from 'react-toastify';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Please enter your full name';
        if (value.trim().length < 2) return 'Full name must contain at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Please enter your email address';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Mobile number is required';
        if (value.replace(/\D/g, '').length !== 10) return 'Mobile number must contain 10 digits';
        return '';
      case 'password': {
        if (!value) return 'Password is required';
        const strength = calculatePasswordStrength(value);
        if (strength.metCount < 3) return 'Please choose a stronger password';
        return '';
      }
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        return '';
      case 'agreedToTerms':
        if (!value) return 'Please accept the Terms & Conditions to proceed';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
    if (field === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== form.confirmPassword ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = {};
    Object.keys(form).forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) newErrors[k] = err;
    });

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreedToTerms: true,
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await register({
        full_name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        role: 'CUSTOMER',
      });

      toast.success('Account created successfully. Please login.');
      navigate('/login', {
        state: { registeredEmail: form.email.trim().toLowerCase() }
      });
    } catch (err) {
      const resp = err.response?.data;
      if (resp) {
        if (resp.email) {
          const emailErr = Array.isArray(resp.email) ? resp.email[0] : resp.email;
          setApiError(emailErr);
        } else if (resp.password) {
          setApiError(Array.isArray(resp.password) ? resp.password[0] : resp.password);
        } else if (resp.confirm_password) {
          setApiError(Array.isArray(resp.confirm_password) ? resp.confirm_password[0] : resp.confirm_password);
        } else if (resp.phone) {
          setApiError(Array.isArray(resp.phone) ? resp.phone[0] : resp.phone);
        } else if (resp.non_field_errors) {
          setApiError(Array.isArray(resp.non_field_errors) ? resp.non_field_errors[0] : resp.non_field_errors);
        } else if (resp.detail) {
          setApiError(resp.detail);
        } else {
          setApiError('Failed to create account. Please check your information.');
        }
      } else {
        setApiError(err.message || 'Network error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
          maxWidth: '1020px',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.25fr)',
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
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(40px)',
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
              Join millions of happy shoppers on ShopSphere.
            </h1>
            <p
              style={{
                fontSize: '0.975rem',
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
              }}
            >
              Sign up today and get instant access to verified authentic products, lightning delivery, and member-exclusive flash deals.
            </p>

            {/* Benefit Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>100% Buyer Protection</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>Genuine products & verified sellers</div>
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
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Fast Pan-India Delivery</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>Free shipping on eligible orders</div>
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
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Hassle-Free 7-Day Returns</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>Doorstep pickup & instant refunds</div>
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

        {/* RIGHT COLUMN: Glass Registration Form */}
        <div
          style={{
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="auth-mobile-logo" style={{ display: 'none', marginBottom: '1.25rem' }}>
              <ShopSphereLogo size="md" to="/" showTagline={true} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Join ShopSphere and start shopping today
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
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label htmlFor="reg-name" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
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
                  <User size={18} />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '0.85rem',
                    borderColor: errors.fullName ? 'var(--danger)' : undefined,
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                />
              </div>
              {errors.fullName && (
                <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Email & Mobile Number Row */}
            <div
              className="reg-contact-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '1rem',
                marginBottom: '1.15rem',
              }}
            >
              {/* Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-email" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Email Address <span style={{ color: 'var(--danger)' }}>*</span>
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
                    id="reg-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@example.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: '0.85rem',
                      borderColor: errors.email ? 'var(--danger)' : undefined,
                      backgroundColor: 'var(--bg-secondary)',
                    }}
                  />
                </div>
                {errors.email && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Mobile Phone */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-phone" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Mobile Number <span style={{ color: 'var(--danger)' }}>*</span>
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
                    <Phone size={18} />
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('phone')}
                    placeholder="10-digit mobile"
                    autoComplete="tel"
                    style={{
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: '0.85rem',
                      borderColor: errors.phone ? 'var(--danger)' : undefined,
                      backgroundColor: 'var(--bg-secondary)',
                    }}
                  />
                </div>
                {errors.phone && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Password with Dynamic Strength Indicator & Requirements Checklist */}
            <PasswordInput
              id="reg-password"
              name="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Create a strong password"
              label="Password"
              required={true}
              showStrength={true}
              error={errors.password}
              autoComplete="new-password"
              leftIcon={<Lock size={18} />}
            />

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="reg-confirm-password" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
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
                  <Lock size={18} />
                </div>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '0.85rem',
                    borderColor: errors.confirmPassword ? 'var(--danger)' : undefined,
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Terms & Conditions Consent Checkbox */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  lineHeight: 1.45,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.agreedToTerms}
                  onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <span>
                  I agree to the{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms & Conditions</span> and{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</span>.
                </span>
              </label>
              {errors.agreedToTerms && (
                <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
                  {errors.agreedToTerms}
                </div>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading || !form.agreedToTerms}
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
                opacity: !form.agreedToTerms ? 0.65 : 1,
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Already have an account link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive layout CSS */}
      <style>{`
        @media (max-width: 860px) {
          .auth-container-grid {
            grid-template-columns: 1fr !important;
            max-width: 480px !important;
          }
          .auth-brand-sidebar {
            display: none !important;
          }
          .auth-mobile-logo {
            display: block !important;
          }
          .reg-contact-row {
            grid-template-columns: 1fr !important;
            gap: 1.15rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
