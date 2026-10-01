import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Store, Package, ShoppingCart, DollarSign,
  Clock, RotateCcw, TrendingUp, ArrowRight, ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/admin.service';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div>Loading admin operations dashboard...</div>;
  }

  if (!data) {
    return <div>Failed to load admin metrics.</div>;
  }

  const maxRevenue = Math.max(...(data.daily_trend?.map((d) => d.revenue) || [100]), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Overview</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Real-time analytics, user growth, revenue metrics, and store operations
        </p>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid-5">
        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue</span>
            <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            ₹{data.total_revenue?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</span>
            <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {data.total_orders}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Users</span>
            <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: 'var(--teal-light)', color: 'var(--teal)' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {data.total_users}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sellers</span>
            <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Store size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {data.total_sellers}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Products Listed</span>
            <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: '#B45309' }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {data.total_products}
          </div>
        </div>
      </div>

      {/* Pending Action Alerts */}
      <div className="dashboard-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: data.pending_sellers > 0 ? 'var(--warning-bg)' : 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} color="#B45309" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{data.pending_sellers} Pending Seller Applications</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require merchant document verification</div>
            </div>
          </div>
          <Link to="/admin/sellers" className="btn btn-secondary btn-sm">
            Review &rarr;
          </Link>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: data.pending_returns > 0 ? 'var(--danger-bg)' : 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <RotateCcw size={20} color="var(--danger)" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{data.pending_returns} Return Requests Pending</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer return & refund claims</div>
            </div>
          </div>
          <Link to="/admin/returns" className="btn btn-secondary btn-sm">
            Manage &rarr;
          </Link>
        </div>
      </div>

      {/* Visual Charts: Daily Revenue Trend & Category Distribution */}
      <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Daily Revenue Trend Bar Chart */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Daily Revenue Trend (Last 7 Days)
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', height: '220px', padding: '1rem 0' }}>
            {data.daily_trend?.map((item) => {
              const heightPct = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div
                  key={item.date}
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
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    ₹{item.revenue > 0 ? `${Math.round(item.revenue / 1000)}k` : '0'}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-hover) 100%)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'height 0.3s ease',
                    }}
                    title={`₹${item.revenue} (${item.orders} orders) on ${item.date}`}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Sales by Category */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Sales by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.category_distribution?.map((cat) => (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{cat.category}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cat.count} sold</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, cat.count * 15 + 10)}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders and Recent Sellers */}
      <div className="dashboard-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Recent Orders */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Orders</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.recent_orders?.map((o) => (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{o.order_id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ₹{o.total_amount} &bull; {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge badge-primary">{o.order_status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sellers */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>New Seller Registrations</h3>
            <Link to="/admin/sellers" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.recent_sellers?.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{s.business_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.owner_name} &bull; {s.phone}</div>
                </div>
                <span className={`badge ${s.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
