import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export const calculatePasswordStrength = (pwd = '') => {
  const requirements = [
    { label: 'At least 8 characters', met: pwd.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(pwd) },
    { label: 'One number (0-9)', met: /[0-9]/.test(pwd) },
    { label: 'One special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(pwd) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  let level = 'Weak';
  let color = '#EF4444';
  let percent = 20;

  if (metCount >= 5) {
    level = 'Strong';
    color = '#10B981';
    percent = 100;
  } else if (metCount >= 3) {
    level = 'Medium';
    color = '#F59E0B';
    percent = 65;
  } else if (metCount >= 1) {
    level = 'Weak';
    color = '#EF4444';
    percent = 30;
  } else {
    percent = 0;
  }

  return { requirements, metCount, level, color, percent };
};

export const PasswordInput = ({
  id,
  name = 'password',
  value = '',
  onChange,
  placeholder = 'Enter password',
  label = 'Password',
  required = false,
  showStrength = false,
  error = '',
  autoComplete = 'current-password',
  leftIcon = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const strength = calculatePasswordStrength(value);

  return (
    <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
      {label && (
        <label htmlFor={id} className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
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
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            paddingLeft: leftIcon ? '2.5rem' : '0.85rem',
            paddingRight: '2.75rem',
            borderColor: error ? 'var(--danger)' : undefined,
            backgroundColor: 'var(--bg-secondary)',
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Strength Meter (when active or has value) */}
      {showStrength && (value.length > 0 || focused) && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Strength:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color }}>
              {strength.level}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '5px',
              width: '100%',
              backgroundColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginBottom: '0.65rem',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${strength.percent}%`,
                backgroundColor: strength.color,
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          </div>

          {/* Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.3rem' }}>
            {strength.requirements.map((req, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  color: req.met ? 'var(--success)' : 'var(--text-muted)',
                  fontWeight: req.met ? 600 : 400,
                }}
              >
                {req.met ? <Check size={12} strokeWidth={3} /> : <X size={12} style={{ opacity: 0.5 }} />}
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
