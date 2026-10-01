import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Package, Users,
  TrendingUp, Clock, PlusCircle, AlertCircle
} from 'lucide-react';
import { sellerService } from '../../services/seller.service';

export const SellerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await sellerService.getSellerDashboard();
        setStats(data);
      } catch (err) {
        console.error('Error fetching seller stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard statistics...</div>;
  }

  if (!stats) {
    return <div>Unable to load seller data.</div>;
  }

  const maxSale = Math.max(...(stats.sales_by_day?.map((d) => d.amount) || [100]), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {stats.seller_name} Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
            <span className={`badge ${stats.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
              {stats.status}
            </span>
          </div>
        </div>

        <Link to="/seller/products/new" className="btn btn-primary">
          <PlusCircle size={16} />
          Add New Product
        </Link>
      </div>

      {stats.status !== 'APPROVED' && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-bg)', color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>
            Your store is currently <strong>{stats.status}</strong>. Products may not be visible to public customers until admin approval.
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid-4">
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue</span>
            <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            ₹{stats.total_sales?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</span>
            <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {stats.total_orders}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Inventory</span>
            <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {stats.active_products} / {stats.total_products}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Dispatch</span>
            <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {stats.pending_orders}
          </div>
        </div>
      </div>

      {/* Sales Trend Chart & Top Products */}
      <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* SVG Daily Sales Chart */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Sales by Day (Last 7 Days)
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', height: '220px', padding: '1rem 0' }}>
            {stats.sales_by_day?.map((day) => {
              const heightPct = Math.max(12, Math.round((day.amount / maxSale) * 100));
              return (
                <div
                  key={day.date}
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{day.amount > 0 ? `${Math.round(day.amount / 1000)}k` : '0'}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, var(--accent) 0%, var(--primary) 100%)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'height 0.4s ease',
                    }}
                    title={`₹${day.amount} on ${day.date}`}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Top Products
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.top_products?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No sales data yet.</p>
            ) : (
              stats.top_products?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ₹{item.price} &bull; Stock: {item.stock}
                    </div>
                  </div>
                  <span className="badge badge-primary">
                    {item.units_sold} sold
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
