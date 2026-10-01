import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Filter } from 'lucide-react';
import { orderService } from '../../services/order.service';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAdminOrders(statusFilter);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Orders Central</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitor and administer customer purchases and order fulfillment
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer Item</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  No orders found.
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
                  <td style={{ fontSize: '0.825rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.first_item_name}
                    </div>
                    {o.items_count > 1 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        +{o.items_count - 1} other item{o.items_count - 1 === 1 ? '' : 's'}
                      </div>
                    )}
                  </td>
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
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {o.tracking_number ? `${o.tracking_number} (${o.courier_name})` : '—'}
                  </td>
                  <td>
                    <Link to={`/orders/${o.id || o.order_id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
