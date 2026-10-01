import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { PasswordInput } from '../components/common/PasswordInput';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';

export const ResetPasswordPage = () => {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(urlToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validatePassword = (val) => {
    if (!val) return 'New password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const validateConfirmPassword = (val, pwd) => {
    if (!val) return 'Please confirm your new password.';
    if (val !== pwd) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ token: true, newPassword: true, confirmPassword: true });

    const tokenToUse = token.trim();
    if (!tokenToUse) {
      setError('Password reset token is required. Please check your reset link.');
      return;
    }

    const pwdErr = validatePassword(newPassword);
    const cfmErr = validateConfirmPassword(confirmPassword, newPassword);

    setErrors({ newPassword: pwdErr, confirmPassword: cfmErr });

    if (pwdErr || cfmErr) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(tokenToUse, newPassword, confirmPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const backendMsg = err.response?.data?.error ||
                         err.response?.data?.new_password?.[0] ||
                         err.response?.data?.confirm_password?.[0] ||
                         err.response?.data?.token?.[0] ||
                         'Unable to reset password. The link may have expired or is invalid.';
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
        maxWidth: '480px',
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

        {!success ? (
          <>
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
                Reset your password
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0
              }}>
                Choose a strong, secure new password for your ShopSphere account.
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
              {!urlToken && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}>
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste the reset token here"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* New Password with live strength indicator & visual requirement checklist */}
              <div style={{ marginBottom: '16px' }}>
                <PasswordInput
                  label="New Password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewPassword(val);
                    if (touched.newPassword) {
                      setErrors(prev => ({ ...prev, newPassword: validatePassword(val) }));
                    }
                    if (touched.confirmPassword && confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, val) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, newPassword: true }));
                    setErrors(prev => ({ ...prev, newPassword: validatePassword(newPassword) }));
                  }}
                  error={errors.newPassword}
                  showStrength={true}
                  placeholder="Create a strong password (min 8 chars)"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '24px' }}>
                <PasswordInput
                  label="Confirm Password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    if (touched.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(val, newPassword) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, confirmPassword: true }));
                    setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, newPassword) }));
                  }}
                  error={errors.confirmPassword}
                  showStrength={false}
                  placeholder="Re-enter your new password"
                  required
                />
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
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '10px'
            }}>
              Password reset successfully.
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}>
              Your ShopSphere account password has been updated. You can now login with your new credentials.
            </p>

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '13px 20px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Back to Login</span>
              <ArrowRight size={16} />
            </button>
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
