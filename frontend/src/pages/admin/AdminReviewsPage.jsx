import React, { useState, useEffect } from 'react';
import { Star, Trash2, Search, MessageSquare, ThumbsUp } from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAdminReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await reviewService.deleteReview(deleteConfirm.id);
      toast.success('Review removed successfully');
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
    } catch (err) {
      toast.error('Failed to delete review');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const term = searchTerm.toLowerCase();
    const product = (r.product_name || '').toLowerCase();
    const user = (r.user_name || '').toLowerCase();
    const comment = (r.comment || '').toLowerCase();
    return product.includes(term) || user.includes(term) || comment.includes(term);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reviews Moderation</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitor customer feedback, ratings, and moderate product discussions
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search reviews, products, users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingBlock: '0.45rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review Title & Comment</th>
              <th>Helpful</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading reviews...
                </td>
              </tr>
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  No customer reviews found.
                </td>
              </tr>
            ) : (
              filteredReviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, maxWidth: '200px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.product_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user_email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#eab30820', color: '#eab308', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Star size={13} fill="#eab308" /> {r.rating}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {r.comment}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      <ThumbsUp size={14} /> {r.helpful_count || 0}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => setDeleteConfirm({ open: true, id: r.id })}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444', borderColor: '#ef444450' }}
                      title="Delete review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review? The product average rating will automatically be recalculated."
        confirmText="Delete"
        danger={true}
      />
    </div>
  );
};
