import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const validateIdentifier = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Please enter your registered email or mobile number.';
    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address.';
      }
    } else {
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        return 'Mobile number must contain 10 digits.';
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setIdentifier(val);
    if (touched) {
      setError(validateIdentifier(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateIdentifier(identifier));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validateIdentifier(identifier);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authService.forgotPassword(identifier.trim());
      setSuccessData(data);
      toast.success('Password reset link generated successfully!');
    } catch (err) {
      const backendMsg = err.response?.data?.email_or_phone?.[0] || 
                         err.response?.data?.error || 
                         'Unable to send reset link. Please check your details and try again.';
      setError(backendMsg);
      toast.error(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--background)',
      padding: '24px 16px',
      position: 'relative'
    }}>
      {/* Background ambient accents */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '800px',
        height: '240px',
        background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo size="lg" showTagline={false} />
        </div>

        {!successData ? (
          <>
            {/* Title & Description */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <KeyRound size={24} />
              </div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '8px',
                letterSpacing: '-0.02em'
              }}>
                Forgot your password?
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0
              }}>
                Enter your registered email or mobile number and we'll help you reset your password.
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: 'var(--danger)',
                fontSize: '13px',
                marginBottom: '20px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  Email or Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@example.com or 10-digit mobile"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    {identifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                  </div>
                </div>
                {error && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--danger)',
                    marginTop: '6px',
                    marginBottom: 0
                  }}>
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '10px'
            }}>
              Reset Link Ready
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              {successData.message}
            </p>

            {successData.reset_token && (
              <div style={{
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  marginBottom: '6px'
                }}>
                  <ShieldCheck size={14} />
                  <span>Instant Reset Available (Demo Mode)</span>
                </div>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  lineHeight: 1.4
                }}>
                  Click below to proceed directly to create your new password:
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/reset-password/${encodeURIComponent(successData.reset_token)}`)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Reset Password Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
