import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, Truck, CheckCircle2,
  Clock, XCircle, RotateCcw, Eye
} from 'lucide-react';
import { orderService } from '../services/order.service';
import { EmptyState } from '../components/common/EmptyState';
import { ProductImage } from '../components/common/ProductImage';
import { Modal } from '../components/common/Modal';
import { toast } from 'react-toastify';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found cheaper elsewhere');
  const [cancelling, setCancelling] = useState(false);

  // Return Modal state
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Damaged or defective item');
  const [returnComments, setReturnComments] = useState('');
  const [returning, setReturning] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    try {
      setCancelling(true);
      await orderService.cancelOrder(cancelModalOrder.id || cancelModalOrder.order_id, cancelReason);
      toast.success('Order cancelled successfully.');
      setCancelModalOrder(null);
      await loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    try {
      setReturning(true);
      await orderService.requestReturn(
        returnModalOrder.id || returnModalOrder.order_id,
        returnReason,
        returnComments
      );
      toast.success('Return request initiated. Our logistics partner will schedule pickup.');
      setReturnModalOrder(null);
      await loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit return request.');
    } finally {
      setReturning(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="badge badge-success" style={{ textTransform: 'none', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <CheckCircle2 size={13} />
            Delivered
          </span>
        );
      case 'Shipped':
      case 'Out for Delivery':
        return (
          <span className="badge badge-primary" style={{ textTransform: 'none', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <Truck size={13} />
            {status}
          </span>
        );
      case 'Packed':
        return (
          <span className="badge badge-accent" style={{ textTransform: 'none', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <Package size={13} />
            Packed
          </span>
        );
      case 'Confirmed':
        return (
          <span className="badge badge-primary" style={{ textTransform: 'none', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <CheckCircle2 size={13} />
            Confirmed
          </span>
        );
      case 'Cancelled':
      case 'Returned':
        return (
          <span className="badge badge-danger" style={{ textTransform: 'none', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <XCircle size={13} />
            {status}
          </span>
        );
      default:
        return (
          <span className="badge badge-warning" style={{ textTransform: 'none', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <Clock size={13} />
            {status || 'Processing'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '3rem', textAlign: 'center', minHeight: '50vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Looks like you haven't placed any orders yet. Discover trending products with fast delivery across India."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            My Orders ({orders.length})
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Check status, view shipping tracking, cancel eligible items or request returns.
          </p>
        </div>

        <Link
          to="/products"
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: '8px', fontSize: '13px' }}
        >
          Continue Shopping
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {orders.map((o) => {
          const orderRef = o.order_id?.startsWith('SS') ? o.order_id : `Order #${o.order_id || 'SS' + String(o.id).padStart(6, '0')}`;
          const isDelivered = o.order_status === 'Delivered';
          const isCancelled = o.order_status === 'Cancelled' || o.order_status === 'Returned';
          const canCancel = o.can_cancel ?? (!isDelivered && !isCancelled && ['Pending', 'Confirmed', 'Processing', 'Packed'].includes(o.order_status));
          const canReturn = o.can_return ?? (isDelivered && !isCancelled);

          // Items to render
          const orderItems = o.items && o.items.length > 0
            ? o.items
            : [{
                id: 'first',
                product_name: o.first_item_name || 'ShopSphere Product',
                product_image: o.first_item_image,
                quantity: o.items_count || 1,
                unit_price: o.total_amount
              }];

          return (
            <div
              key={o.id}
              className="card"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              {/* Order Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  backgroundColor: 'var(--surface-secondary)',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    {orderRef}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Placed on {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {o.courier_name && <> &bull; Courier: <span style={{ color: 'var(--text-secondary)' }}>{o.courier_name}</span></>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{Number(o.total_amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>{getStatusBadge(o.order_status)}</div>
                </div>
              </div>

              {/* Order Products List */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orderItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                      <ProductImage
                        src={item.product_image || o.first_item_image}
                        alt={item.product_name}
                        fallbackType="product"
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border)',
                          padding: '4px',
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {item.product_name}
                        </div>
                        {item.variant_info && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Variant: {item.variant_info}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Qty: <strong>{item.quantity}</strong> &bull; Price: ₹{Number(item.unit_price || o.total_amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Action Buttons Row (Requirement 20) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                {/* 1. Cancel Order Button (active when eligible) */}
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setCancelModalOrder(o)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <XCircle size={15} />
                    <span>Cancel Order</span>
                  </button>
                )}

                {/* 2. Return Product Button (active when delivered) */}
                {canReturn && (
                  <button
                    type="button"
                    onClick={() => setReturnModalOrder(o)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Return Product</span>
                  </button>
                )}

                {/* 3. Track Order Button */}
                <button
                  type="button"
                  onClick={() => navigate(`/orders/${o.id || o.order_id}`)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Truck size={15} color="var(--primary)" />
                  <span>Track Order</span>
                </button>

                {/* 4. View Details Button */}
                <Link
                  to={`/orders/${o.id || o.order_id}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Eye size={15} />
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        title="Cancel Order"
        maxWidth="460px"
      >
        <form onSubmit={handleCancelSubmit}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Are you sure you want to cancel order <strong>{cancelModalOrder?.order_id}</strong>? If prepaid, your refund will be credited within 3-5 business days.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Reason for cancellation:
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            >
              <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
              <option value="Order created by mistake">Order created by mistake</option>
              <option value="Expected delivery time is too long">Expected delivery time is too long</option>
              <option value="Change of delivery address required">Change of delivery address required</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setCancelModalOrder(null)}
              className="btn btn-secondary"
              style={{ borderRadius: '8px' }}
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="btn btn-danger"
              style={{ borderRadius: '8px' }}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Product Modal */}
      <Modal
        isOpen={!!returnModalOrder}
        onClose={() => setReturnModalOrder(null)}
        title="Return Request"
        maxWidth="460px"
      >
        <form onSubmit={handleReturnSubmit}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Initiating return for order <strong>{returnModalOrder?.order_id}</strong>. Eligible for pickup within 48 hours.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Reason for return:
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            >
              <option value="Damaged or defective item">Damaged or defective item</option>
              <option value="Wrong product received">Wrong product received</option>
              <option value="Item not matching description">Item not matching description</option>
              <option value="Quality not satisfactory">Quality not satisfactory</option>
              <option value="Size/fit issue">Size/fit issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Additional comments (optional):
            </label>
            <textarea
              rows={3}
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="Tell us what went wrong..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setReturnModalOrder(null)}
              className="btn btn-secondary"
              style={{ borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={returning}
              className="btn btn-primary"
              style={{ borderRadius: '8px' }}
            >
              {returning ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
