import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Modal } from '../../components/common/Modal';
import { toast } from 'react-toastify';

export const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [activeOrder, setActiveOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('BlueDart Express');
  const [updating, setUpdating] = useState(false);

  const loadSellerOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getSellerOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerOrders();
  }, []);

  const handleOpenStatusModal = (order, nextStatus) => {
    setActiveOrder(order);
    setTargetStatus(nextStatus);
    setTrackingNumber(order.tracking_number || `TRK-${Date.now().toString().slice(-6)}`);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await orderService.updateSellerOrderStatus(
        activeOrder.id,
        targetStatus,
        trackingNumber,
        courierName
      );
      setActiveOrder(null);
      await loadSellerOrders();
      toast.success(`Order #${activeOrder.order_id} marked as ${targetStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Orders & Fulfillment</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Process incoming orders, generate shipping labels, and track deliveries
        </p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Fulfillment Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  No customer orders received yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/orders/${o.id || o.order_id}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {o.order_id}
                    </Link>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {o.payment_method} &bull; {o.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      o.order_status === 'Delivered'
                        ? 'badge-success'
                        : o.order_status === 'Cancelled' || o.order_status === 'Returned'
                        ? 'badge-danger'
                        : o.order_status === 'Packed'
                        ? 'badge-accent'
                        : o.order_status === 'Shipped' || o.order_status === 'Confirmed'
                        ? 'badge-primary'
                        : 'badge-warning'
                    }`}>
                      {o.order_status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {o.order_status === 'Pending' && (
                        <button
                          onClick={() => handleOpenStatusModal(o, 'Confirmed')}
                          className="btn btn-secondary btn-sm"
                        >
                          Accept Order
                        </button>
                      )}

                      {o.order_status === 'Confirmed' && (
                        <button
                          onClick={() => handleOpenStatusModal(o, 'Packed')}
                          className="btn btn-secondary btn-sm"
                        >
                          Mark Packed
                        </button>
                      )}

                      {o.order_status === 'Packed' && (
                        <button
                          onClick={() => handleOpenStatusModal(o, 'Shipped')}
                          className="btn btn-primary btn-sm"
                        >
                          <Truck size={14} />
                          Dispatch / Ship
                        </button>
                      )}

                      {o.order_status === 'Shipped' && (
                        <button
                          onClick={() => handleOpenStatusModal(o, 'Delivered')}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={14} />
                          Mark Delivered
                        </button>
                      )}

                      {o.order_status === 'Delivered' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                          Fulfilled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Status Transition Modal */}
      {activeOrder && (
        <Modal
          isOpen={Boolean(activeOrder)}
          onClose={() => setActiveOrder(null)}
          title={`Update Fulfillment: ${targetStatus}`}
          maxWidth="460px"
        >
          <form onSubmit={handleUpdateStatus}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Transition order <strong>{activeOrder.order_id}</strong> to status <strong>{targetStatus}</strong>.
            </p>

            {targetStatus === 'Shipped' && (
              <>
                <div className="form-group">
                  <label className="form-label">Courier Partner *</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    required
                  >
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="DTDC Express">DTDC Express</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Ekart Logistics">Ekart Logistics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tracking / AWB Number *</label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
