import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Sparkles, Award, Grid, ChevronDown } from 'lucide-react';
import { categoryService } from '../../services/category.service';

export const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch {
        // Fallback static list
      }
    };
    loadCategories();
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Deals', path: '/products?discount=20', icon: Flame, color: '#EF4444' },
    { label: 'New Arrivals', path: '/products?ordering=newest', icon: Sparkles, color: 'var(--accent)' },
    { label: 'Best Sellers', path: '/products?ordering=popularity', icon: Award, color: '#F59E0B' },
    { label: 'Fashion', path: '/products?category=fashion' },
    { label: 'Electronics', path: '/products?category=electronics' },
    { label: 'Home & Kitchen', path: '/products?category=home-kitchen' },
    { label: 'Beauty', path: '/products?category=beauty' },
    { label: 'Sports', path: '/products?category=sports-fitness' },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        zIndex: 90,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          height: 'var(--navbar-height)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {/* Categories Mega Dropdown trigger */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowMegaMenu(true)}
          onMouseLeave={() => setShowMegaMenu(false)}
        >
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
            }}
          >
            <Grid size={16} color="var(--primary)" />
            <span>All Categories</span>
            <ChevronDown size={14} />
          </button>

          {/* Mega Menu Dropdown */}
          {showMegaMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '680px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.25rem',
                zIndex: 150,
              }}
            >
              {categories.slice(0, 9).map((cat) => (
                <div key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug || cat.id}`}
                    onClick={() => setShowMegaMenu(false)}
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.4rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '0.25rem',
                    }}
                  >
                    {cat.name}
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {cat.subcategories?.slice(0, 4).map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/products?subcategory=${sub.slug || sub.id}`}
                        onClick={() => setShowMegaMenu(false)}
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          transition: 'color 150ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlight navigation links */}
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname + location.search === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {Icon && <Icon size={15} color={item.color || 'currentColor'} />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
