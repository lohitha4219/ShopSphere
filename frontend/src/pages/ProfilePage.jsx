import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User, Package, Heart, MapPin, Bell, Settings, LogOut,
  Plus, Trash2, CheckCircle2, Edit3, Phone, Mail,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { Modal } from '../components/common/Modal';
import { LogoutModal } from '../components/common/LogoutModal';
import { toast } from 'react-toastify';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('addresses')) return 'addresses';
      if (window.location.pathname.includes('settings')) return 'security';
      if (window.location.pathname.includes('notifications')) return 'notifications';
    }
    return 'profile';
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('addresses')) {
      setActiveTab('addresses');
    } else if (location.pathname.includes('settings')) {
      setActiveTab('security');
    } else if (location.pathname.includes('notifications')) {
      setActiveTab('notifications');
    } else if (location.pathname === '/profile') {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleteAddrModalOpen, setIsDeleteAddrModalOpen] = useState(false);

  const [newAddrForm, setNewAddrForm] = useState({
    full_name: '',
    phone: '',
    house_flat: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'HOME',
  });
  const [savingAddr, setSavingAddr] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promoOffers: true,
    smsAlerts: false,
    whatsappAlerts: true
  });

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await authService.getAddresses();
      setAddresses(data || []);
    } catch {
      // Ignore
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg('');
      const updated = await authService.updateProfile(profileForm);
      updateUser(updated);
      setProfileMsg('Profile updated successfully!');
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    try {
      setSavingPassword(true);
      await authService.changePassword(passwordForm);
      setPasswordMsg('Password changed successfully.');
      toast.success('Password changed successfully.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errTxt = err.response?.data?.old_password || err.response?.data?.message || 'Failed to update password.';
      setPasswordError(errTxt);
      toast.error(errTxt);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      setSavingAddr(true);
      await authService.createAddress(newAddrForm);
      setIsAddressModalOpen(false);
      setNewAddrForm({
        full_name: '',
        phone: '',
        house_flat: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        address_type: 'HOME',
      });
      await loadAddresses();
      toast.success('Address saved successfully!');
    } catch {
      toast.error('Failed to save address.');
    } finally {
      setSavingAddr(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await authService.deleteAddress(addressToDelete.id);
      await loadAddresses();
      toast.info('Address removed successfully');
    } catch {
      toast.error('Failed to delete address');
    } finally {
      setIsDeleteAddrModalOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id) => {
    await authService.setDefaultAddress(id);
    await loadAddresses();
    toast.success('Default address updated');
  };

  // Initials for avatar
  const initials = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase() +
                   (user?.last_name?.[0] || '').toUpperCase();

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          My Account
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Manage your personal info, delivery addresses, order preferences and security.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '2rem', alignItems: 'flex-start' }} className="profile-layout-grid">
        
        {/* ========================================================= */}
        {/* SIDEBAR                                                   */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Profile Card */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                }}
              >
                {initials}
              </div>

              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.full_name || user?.username || 'ShopSphere Member'}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.email}
                </div>
                <div style={{ display: 'inline-block', marginTop: '0.35rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                    {user?.role || 'CUSTOMER'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="var(--primary)" />
                <span>{user?.phone || 'No mobile linked'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="var(--primary)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                backgroundColor: activeTab === 'profile' ? 'var(--primary)' : 'var(--surface-secondary)',
                color: activeTab === 'profile' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className="card"
            style={{
              padding: '0.5rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            {/* 1. Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                backgroundColor: activeTab === 'profile' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              <User size={18} />
              <span>Profile Information</span>
            </button>

            {/* 2. Orders */}
            <Link
              to="/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              <Package size={18} />
              <span>My Orders</span>
            </Link>

            {/* 3. Wishlist */}
            <Link
              to="/wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              <Heart size={18} />
              <span>Wishlist</span>
            </Link>

            {/* 4. Addresses */}
            <button
              onClick={() => setActiveTab('addresses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: activeTab === 'addresses' ? 700 : 500,
                backgroundColor: activeTab === 'addresses' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              <MapPin size={18} />
              <span>Addresses ({addresses.length})</span>
            </button>

            {/* 5. Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: activeTab === 'notifications' ? 700 : 500,
                backgroundColor: activeTab === 'notifications' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: activeTab === 'settings' ? 700 : 500,
                backgroundColor: activeTab === 'settings' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              <Settings size={18} />
              <span>Security & Settings</span>
            </button>

            {/* 7. Logout */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
              <button
                onClick={() => setShowLogoutModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '0.9rem',
                  transition: 'all 0.15s'
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ACCOUNT CONTENT PANELS                                    */}
        {/* ========================================================= */}
        <div style={{ minWidth: 0 }}>
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Profile Information
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Update your identity details for order communication and customer care.
              </p>

              {profileMsg && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: 'var(--success)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{profileMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.7, backgroundColor: 'var(--surface-secondary)', borderRadius: '8px' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Email is associated with your primary authentication credentials.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Mobile Number (10 digits)</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter 10-digit mobile number"
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProfile}
                  style={{ borderRadius: '8px', padding: '10px 24px', fontWeight: 600 }}
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Manage Delivery Addresses
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Add or modify delivery destinations for single-click checkouts.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {loadingAddresses ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading saved addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  border: '1px dashed var(--border)',
                  borderRadius: '12px'
                }}>
                  <MapPin size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>No Addresses Saved Yet</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                    Add a delivery address to enjoy seamless checkout.
                  </p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    Add Address Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: addr.is_default ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: 'var(--surface-secondary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{addr.full_name}</strong>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{addr.address_type}</span>
                          {addr.is_default && (
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                              Default Address
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {addr.house_flat}, {addr.street}, {addr.area}
                          <br />
                          {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          {addr.landmark && <><br /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Landmark: {addr.landmark}</span></>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          Contact: <strong>{addr.phone}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAddressToDelete(addr);
                            setIsDeleteAddrModalOpen(true);
                          }}
                          style={{
                            padding: '6px',
                            color: 'var(--danger)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Delete address"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Notification Preferences
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Choose which channels you want to receive order updates, delivery notices, and offers on.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { key: 'orderUpdates', label: 'Order Status & Tracking Updates', desc: 'Real-time emails when your package is packed, shipped, or out for delivery.' },
                  { key: 'whatsappAlerts', label: 'WhatsApp Instant Notifications', desc: 'Direct message delivery OTPs and tracking links straight to your WhatsApp.' },
                  { key: 'promoOffers', label: 'Exclusive Discounts & Festive Deals', desc: 'Occasional handpicked sale announcements and personalized coupon codes.' },
                  { key: 'smsAlerts', label: 'SMS Delivery Dispatch Notices', desc: 'Standard SMS alerts when courier attempts delivery at your doorstep.' }
                ].map((item) => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-secondary)',
                      cursor: 'pointer',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => {
                        setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }));
                        toast.success('Notification preference updated.');
                      }}
                      style={{ marginTop: '3px', accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & SECURITY */}
          {activeTab === 'settings' && (
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                maxWidth: '560px'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Change Password
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Ensure your account is protected with an 8+ character password.
              </p>

              {passwordMsg && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: 'var(--success)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{passwordMsg}</span>
                </div>
              )}

              {passwordError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: 'var(--danger)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>New Password (min 8 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingPassword}
                  style={{ borderRadius: '8px', padding: '10px 24px', fontWeight: 600 }}
                >
                  {savingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Address"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateAddress}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={newAddrForm.full_name}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, full_name: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="text"
                required
                value={newAddrForm.phone}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, phone: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">House / Flat / Building *</label>
            <input
              type="text"
              required
              value={newAddrForm.house_flat}
              onChange={(e) => setNewAddrForm({ ...newAddrForm, house_flat: e.target.value })}
              style={{ borderRadius: '8px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street / Colony *</label>
            <input
              type="text"
              required
              value={newAddrForm.street}
              onChange={(e) => setNewAddrForm({ ...newAddrForm, street: e.target.value })}
              style={{ borderRadius: '8px' }}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Area *</label>
              <input
                type="text"
                required
                value={newAddrForm.area}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, area: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                value={newAddrForm.city}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, city: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                required
                value={newAddrForm.state}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, state: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode (6 digits) *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={newAddrForm.pincode}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, pincode: e.target.value.replace(/\D/g, '') })}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Landmark (Optional)</label>
            <input
              type="text"
              value={newAddrForm.landmark}
              onChange={(e) => setNewAddrForm({ ...newAddrForm, landmark: e.target.value })}
              style={{ borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="btn btn-secondary"
              style={{ borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingAddr} style={{ borderRadius: '8px' }}>
              {savingAddr ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Address Confirmation Modal */}
      <Modal
        isOpen={isDeleteAddrModalOpen}
        onClose={() => setIsDeleteAddrModalOpen(false)}
        title="Delete Address"
        maxWidth="420px"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Are you sure you want to remove the address for <strong>{addressToDelete?.full_name}</strong> ({addressToDelete?.city})? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsDeleteAddrModalOpen(false)}
              className="btn btn-secondary"
              style={{ borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteAddress}
              className="btn btn-danger"
              style={{ borderRadius: '8px' }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};
