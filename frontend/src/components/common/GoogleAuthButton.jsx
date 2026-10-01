import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Official Google "G" Logo SVG as required by Google Branding Guidelines
 */
export const GoogleIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
    aria-hidden="true"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleAuthButton = ({
  onSuccess,
  onError,
  disabled = false,
  text = 'Continue with Google'
}) => {
  const [connecting, setConnecting] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Initialize Google Identity Services if available and client ID is set
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    }
  }, [clientId]);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setConnecting(false);
      return;
    }
    setConnecting(true);
    try {
      if (onSuccess) {
        await onSuccess(response.credential);
      }
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        toast.error('Unable to verify your Google account. Please try again.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleClick = () => {
    if (disabled || connecting) return;

    if (!clientId) {
      toast.info(
        'Google OAuth requires VITE_GOOGLE_CLIENT_ID. Please configure it in your frontend/.env file.',
        { autoClose: 5000 }
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      toast.error('Google sign-in services are still initializing. Please try again in a moment.');
      return;
    }

    setConnecting(true);

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true,
      });

      // Prompt the official Google account chooser popup
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // User closed popup or prompt wasn't displayed
          setConnecting(false);
        }
      });
    } catch (err) {
      setConnecting(false);
      if (onError) {
        onError(err);
      } else {
        toast.error('Google sign-in was unsuccessful. Please try again.');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || connecting}
      className="btn-google-auth"
      style={{
        width: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        fontSize: '0.925rem',
        fontWeight: 600,
        fontFamily: "'Roboto', 'Inter', -apple-system, sans-serif",
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled || connecting ? 'not-allowed' : 'pointer',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
      aria-label={connecting ? 'Connecting to Google' : text}
    >
      {connecting ? (
        <>
          <div
            style={{
              width: '18px',
              height: '18px',
              border: '2px solid rgba(66, 133, 244, 0.25)',
              borderTopColor: '#4285F4',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon size={18} />
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default GoogleAuthButton;
