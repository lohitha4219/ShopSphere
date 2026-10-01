import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle2, Clock, AlertTriangle,
  RotateCcw, ShieldCheck, MapPin, ArrowLeft, ShoppingBag
} from 'lucide-react';
import { orderService } from '../services/order.service';
import { Modal } from '../components/common/Modal';
import { ProductImage } from '../components/common/ProductImage';
import { toast } from 'react-toastify';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Return Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged product');
  const [returnComments, setReturnComments] = useState('');

  const returnReasons = [
    'Damaged product',
    'Wrong product',
    'Product not as described',
    'Size issue',
    'Quality issue',
    'Other',
  ];

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderDetail(id);
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await orderService.cancelOrder(order.id, cancelReason || 'Customer requested cancellation');
      setIsCancelModalOpen(false);
      await loadOrderDetail();
      toast.success('Order cancelled successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await orderService.requestReturn(order.id, returnReason, returnComments);
      setIsReturnModalOpen(false);
      await loadOrderDetail();
      toast.success('Return request submitted. Our team will review your request.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit return request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  // Visual Stepper Progression
  const allMilestones = [
    'Order Placed',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const statusIndexMap = {
    'Pending': 0,
    'Confirmed': 1,
    'Processing': 2,
    'Packed': 3,
    'Shipped': 4,
    'Out for Delivery': 5,
    'Delivered': 6,
    'Cancelled': -1,
    'Returned': -2,
  };

  const currentIdx = statusIndexMap[order.order_status] ?? 0;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      
      {/* Top Bar with Back link & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Order #{order.order_id}
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {order.can_cancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="btn btn-danger btn-sm"
            >
              Cancel Order
            </button>
          )}

          {order.can_return && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="btn btn-outline btn-sm"
            >
              <RotateCcw size={15} />
              Request Return
            </button>
          )}
        </div>
      </div>

      {/* VISUAL TIMELINE STEPPER TRACKING */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order Tracking Status</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Current Status: <strong style={{ color: 'var(--primary)' }}>{order.order_status}</strong>
            </div>
          </div>

          {order.tracking_number && (
            <div
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Tracking #{order.tracking_number} via {order.courier_name || 'Express Courier'}
            </div>
          )}
        </div>

        {order.order_status === 'Cancelled' ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            Order has been cancelled. Reason: {order.cancellation_reason || 'Cancelled by customer'}
          </div>
        ) : order.order_status === 'Returned' ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-bg)', color: '#B45309', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            Return request approved and processed for this order. Refund has been initiated.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              overflowX: 'auto',
              padding: '1rem 0',
            }}
          >
            {allMilestones.map((m, idx) => {
              const isPast = currentIdx >= idx;
              const isNow = currentIdx === idx;

              return (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, minWidth: '90px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isPast ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: isPast ? '#FFFFFF' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isNow ? '3px solid var(--accent)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isPast ? <CheckCircle2 size={20} /> : <Clock size={18} />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: isNow ? 800 : isPast ? 600 : 400,
                      color: isNow ? 'var(--primary)' : 'var(--text-secondary)',
                      marginTop: '0.5rem',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Timeline Events History */}
        {order.timeline?.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Timeline Updates</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {order.timeline.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ minWidth: '120px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <strong>{item.status}:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Order Items on Left + Delivery/Price Details on Right */}
      <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Order Items List */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Items in this Order ({order.items?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <ProductImage
                  src={item.product_image}
                  alt={item.product_name}
                  fallbackType="product"
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.25rem',
                  }}
                />
                <div style={{ flexGrow: 1 }}>
                  {item.product_slug ? (
                    <Link to={`/products/${item.product_slug}`} style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {item.product_name}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.product_name}</span>
                  )}
                  {item.variant_info && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>{item.variant_info}</div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} &times; ₹{Number(item.unit_price).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  ₹{Number(item.total_price).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Info Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Shipping Address */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Delivery Address
            </div>
            {order.shipping_address && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{order.shipping_address.full_name}</strong>
                <div>{order.shipping_address.house_flat}, {order.shipping_address.street}</div>
                <div>{order.shipping_address.area}, {order.shipping_address.city}</div>
                <div>{order.shipping_address.state} - <strong>{order.shipping_address.pincode}</strong></div>
                <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Phone: {order.shipping_address.phone}
                </div>
              </div>
            )}
          </div>

          {/* Payment & Price Summary */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Payment & Totals</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Method:</span>
                <strong>{order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Paid'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Status:</span>
                <span className={`badge ${order.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                <span>Subtotal:</span>
                <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Discount:</span>
                  <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {Number(order.coupon_discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Coupon ({order.coupon_code}):</span>
                  <span>-₹{Number(order.coupon_discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>{Number(order.delivery_fee) === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                <span>Total Amount:</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
        maxWidth="460px"
      >
        <form onSubmit={handleCancelOrder}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Are you sure you want to cancel order #{order.order_id}? Any reserved items will be restored.
          </p>
          <div className="form-group">
            <label className="form-label">Reason for cancellation *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Changed my mind, found better price, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="btn btn-secondary"
            >
              Keep Order
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Request Return & Refund"
        maxWidth="480px"
      >
        <form onSubmit={handleReturnOrder}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Please select the reason for return. Once submitted, our seller and admin team will review it.
          </p>
          <div className="form-group">
            <label className="form-label">Return Reason *</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              required
            >
              {returnReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Additional Comments / Details</label>
            <textarea
              rows={3}
              placeholder="Describe the defect, wrong item received, or size issue..."
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
