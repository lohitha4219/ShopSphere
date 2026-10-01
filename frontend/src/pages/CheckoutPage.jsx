import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, CheckCircle2, CreditCard, ShieldCheck,
  Plus, Edit, Trash2, ArrowRight, ArrowLeft, PackageCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { Modal } from '../components/common/Modal';
import { ProductImage } from '../components/common/ProductImage';
import { toast } from 'react-toastify';

export const CheckoutPage = () => {
  const { cart, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If passed directly via "Buy Now"
  const directItem = location.state?.directItem || null;

  // Multi-step: 1 = Address, 2 = Summary, 3 = Payment, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
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
  const [savingAddress, setSavingAddress] = useState(false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or RAZORPAY
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [orderError, setOrderError] = useState('');

  // Load Addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const data = await authService.getAddresses();
        setAddresses(data || []);
        const defaultAddr = data?.find((a) => a.is_default) || data?.[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error('Error loading addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const newAddr = await authService.createAddress(addressForm);
      setAddresses([newAddr, ...addresses]);
      setSelectedAddressId(newAddr.id);
      setIsAddressModalOpen(false);
      setAddressForm({
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
      toast.success('Address saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Compute Order summary values
  let summarySubtotal = 0;
  let summaryDiscount = 0;
  let summaryCoupon = 0;
  let summaryDelivery = 0;
  let summaryTotal = 0;
  let checkoutItems = [];

  if (directItem) {
    const prod = directItem.product;
    const varAdj = directItem.variant ? Number(directItem.variant.price_adjustment) : 0;
    const unitPrice = (prod.discount_price ? Number(prod.discount_price) : Number(prod.price)) + varAdj;
    const origPrice = Number(prod.price) + varAdj;
    const qty = directItem.quantity || 1;

    summarySubtotal = origPrice * qty;
    summaryDiscount = (origPrice - unitPrice) * qty;
    summaryDelivery = (origPrice - summaryDiscount) >= 500 ? 0 : 40;
    summaryTotal = (summarySubtotal - summaryDiscount) + summaryDelivery;
    checkoutItems = [{
      id: prod.id,
      product: prod,
      variant: directItem.variant,
      quantity: qty,
      unit_price: unitPrice,
      original_unit_price: origPrice,
    }];
  } else {
    summarySubtotal = Number(cart.subtotal) || 0;
    summaryDiscount = Number(cart.discount) || 0;
    summaryCoupon = Number(cart.coupon_discount) || 0;
    summaryDelivery = Number(cart.delivery_fee) || 0;
    summaryTotal = Number(cart.total_amount) || 0;
    checkoutItems = cart.items || [];
  }

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address to proceed.');
      setCurrentStep(1);
      return;
    }

    try {
      setSubmittingOrder(true);
      setOrderError('');

      const payload = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        notes: orderNotes,
      };

      if (directItem) {
        payload.direct_product_id = directItem.product.id;
        payload.direct_variant_id = directItem.variant?.id || null;
        payload.direct_quantity = directItem.quantity || 1;
      }

      const orderData = await orderService.createOrder(payload);
      const placed = orderData.order;

      // If Razorpay Online simulation is chosen:
      if (paymentMethod === 'RAZORPAY') {
        const session = await paymentService.createPaymentSession(placed.id);
        // Simulate immediate successful verification in development
        await paymentService.verifyPayment({
          order_id: placed.id,
          gateway_order_id: session.gateway_session.gateway_order_id,
          gateway_payment_id: `pay_${Date.now()}`,
          gateway_signature: 'simulated_signature_valid',
        });
      }

      setCreatedOrder(placed);
      if (!directItem) {
        await fetchCart();
      }
      setCurrentStep(4); // Move to Confirmation Step
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Order placement failed. Please verify stock.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const steps = [
    { num: 1, label: 'Delivery Address' },
    { num: 2, label: 'Order Summary' },
    { num: 3, label: 'Payment Method' },
    { num: 4, label: 'Confirmation' },
  ];

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      
      {/* Checkout Stepper Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '650px', width: '100%', justifyContent: 'space-between', position: 'relative' }}>
          {steps.map((st, idx) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: isCurrent ? '3px solid var(--primary-light)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : st.num}
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginTop: '0.4rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {orderError && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
          {orderError}
        </div>
      )}

      {/* STEP 4: ORDER CONFIRMED CELEBRATION */}
      {currentStep === 4 && createdOrder && (
        <div
          className="card"
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <PackageCheck size={48} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Order Confirmed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Thank you for shopping with ShopSphere. Your order reference is{' '}
            <strong style={{ color: 'var(--primary)' }}>{createdOrder.order_id}</strong>.
          </p>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'left',
              marginBottom: '2rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Total Paid / Payable:</span>
              <strong style={{ fontSize: '1.05rem' }}>₹{Number(createdOrder.total_amount).toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Payment Mode:</span>
              <span>{createdOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Paid'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Pincode:</span>
              <span>{createdOrder.shipping_address?.pincode}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to={`/orders/${createdOrder.id || createdOrder.order_id}`} className="btn btn-primary">
              Track Order Status
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* STEPS 1 TO 3 GRID */}
      {currentStep < 4 && (
        <div className="checkout-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2.5rem', alignItems: 'flex-start' }}>
          
          {/* Main Step Body */}
          <div>
            
            {/* STEP 1: ADDRESS SELECTION */}
            {currentStep === 1 && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Select Delivery Address</h3>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={15} />
                    Add New Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <div>Loading saved addresses...</div>
                ) : addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No saved addresses found.</p>
                    <button onClick={() => setIsAddressModalOpen(true)} className="btn btn-primary btn-sm">
                      + Add Address
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.75rem',
                          }}
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            style={{ marginTop: '0.2rem' }}
                          />
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <strong style={{ fontSize: '0.95rem' }}>{addr.full_name}</strong>
                              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                                {addr.address_type}
                              </span>
                              {addr.is_default && (
                                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {addr.house_flat}, {addr.street}, {addr.area}
                              <br />
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Phone: {addr.phone}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    disabled={!selectedAddressId}
                    onClick={() => setCurrentStep(2)}
                    className="btn btn-primary"
                  >
                    Proceed to Order Summary &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ORDER SUMMARY */}
            {currentStep === 2 && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Review Order Items
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {checkoutItems.map((ci) => (
                    <div
                      key={ci.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <ProductImage
                        src={ci.product?.thumbnail || ci.product?.images?.[0]?.image}
                        alt={ci.product?.name}
                        fallbackType="product"
                        style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '0.2rem' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ci.product?.name}</div>
                        {ci.variant && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {ci.variant.variant_type}: {ci.variant.name}
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Qty: {ci.quantity} &times; ₹{Number(ci.unit_price).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        ₹{(Number(ci.unit_price) * ci.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Instructions / Customer Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Leave with security guard, or call before arrival"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                    &larr; Back to Address
                  </button>
                  <button onClick={() => setCurrentStep(3)} className="btn btn-primary">
                    Proceed to Payment &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {currentStep === 3 && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Select Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {/* Option 1: COD */}
                  <label
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: paymentMethod === 'COD' ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Pay cash or UPI directly to courier upon delivery at your doorstep.
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Razorpay Online Payment */}
                  <label
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'RAZORPAY' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: paymentMethod === 'RAZORPAY' ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <CreditCard size={18} color="var(--primary)" />
                        Razorpay Online Payment (UPI, Card, NetBanking)
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Supports PhonePe, Google Pay, Paytm, Credit/Debit Cards, and Net Banking.
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
                    &larr; Back to Summary
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submittingOrder}
                    className="btn btn-primary btn-lg"
                  >
                    {submittingOrder ? 'Processing Order...' : `Pay ₹${summaryTotal.toLocaleString('en-IN')} & Place Order`}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right: Sticky Order Summary Card */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Order Price Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({checkoutItems.length} items)</span>
                <span>₹{summarySubtotal.toLocaleString('en-IN')}</span>
              </div>

              {summaryDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Product Savings</span>
                  <span>-₹{summaryDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {summaryCoupon > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Coupon Savings</span>
                  <span>-₹{summaryCoupon.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charge</span>
                <span>{summaryDelivery === 0 ? <strong style={{ color: 'var(--teal)' }}>FREE</strong> : `₹${summaryDelivery}`}</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                <span>Total Amount</span>
                <span>₹{summaryTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--success)" />
              Safe and Encrypted Payment Gateway
            </div>
          </div>

        </div>
      )}

      {/* New Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Delivery Address"
        maxWidth="520px"
      >
        <form onSubmit={handleCreateAddress}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={addressForm.full_name}
                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Flat, House no., Building, Apartment *</label>
            <input
              type="text"
              required
              value={addressForm.house_flat}
              onChange={(e) => setAddressForm({ ...addressForm, house_flat: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street, Sector, Village *</label>
            <input
              type="text"
              required
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Area / Locality *</label>
              <input
                type="text"
                required
                value={addressForm.area}
                onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                required
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">6-Digit Pincode *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['HOME', 'WORK', 'OTHER'].map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="addressType"
                    checked={addressForm.address_type === type}
                    onChange={() => setAddressForm({ ...addressForm, address_type: type })}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingAddress}
            >
              {savingAddress ? 'Saving...' : 'Save & Select Address'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
