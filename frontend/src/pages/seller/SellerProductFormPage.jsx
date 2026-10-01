import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Package, UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { getImageUrl } from '../../utils/image';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export const SellerProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    price: '',
    discount_price: '',
    discount_percentage: 0,
    stock_quantity: 10,
    minimum_order_quantity: 1,
    short_description: '',
    description: '',
    is_active: true,
    is_featured: false,
    is_best_seller: false,
  });

  const [variants, setVariants] = useState([]);

  // Image upload states
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [additionalFiles, setAdditionalFiles] = useState([]); // Array of { file?: File, preview: string, id?: number }

  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const cats = await categoryService.getCategories({ flat: 'true' });
        setCategories(cats || []);

        if (isEdit) {
          const prod = await productService.getProduct(id);
          setForm({
            name: prod.name || '',
            category: prod.category?.id || '',
            subcategory: prod.subcategory?.id || '',
            brand: prod.brand || '',
            sku: prod.sku || '',
            price: prod.price || '',
            discount_price: prod.discount_price || '',
            discount_percentage: prod.discount_percentage || 0,
            stock_quantity: prod.stock_quantity || 0,
            minimum_order_quantity: prod.minimum_order_quantity || 1,
            short_description: prod.short_description || '',
            description: prod.description || '',
            is_active: prod.is_active,
            is_featured: prod.is_featured,
            is_best_seller: prod.is_best_seller,
          });
          setVariants(prod.variants || []);

          if (prod.thumbnail) {
            setThumbnailPreview(getImageUrl(prod.thumbnail));
          }
          if (prod.images && prod.images.length > 0) {
            setAdditionalFiles(
              prod.images.map((img) => ({
                id: img.id,
                preview: getImageUrl(img.image),
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error initializing form:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return `Unsupported format for "${file.name}". Please upload JPG, PNG, or WEBP images.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    setImageError('');
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEntries = [];
    for (const f of files) {
      const err = validateFile(f);
      if (err) {
        setImageError(err);
        return;
      }
      newEntries.push({
        file: f,
        preview: URL.createObjectURL(f),
      });
    }
    setImageError('');
    setAdditionalFiles((prev) => [...prev, ...newEntries]);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePriceChange = (priceVal, discPriceVal) => {
    const p = parseFloat(priceVal) || 0;
    const dp = parseFloat(discPriceVal) || 0;
    let pct = 0;
    if (p > 0 && dp > 0 && dp < p) {
      pct = Math.round(((p - dp) / p) * 100);
    }
    setForm({
      ...form,
      price: priceVal,
      discount_price: discPriceVal,
      discount_percentage: pct,
    });
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { variant_type: 'Size', name: '', price_adjustment: '0.00', stock_quantity: 10 },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setImageError('');
    setSubmitting(true);

    try {
      const payload = { ...form };
      if (!payload.subcategory) delete payload.subcategory;

      // Construct FormData for multipart submission
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      let savedProduct;
      if (isEdit) {
        savedProduct = await productService.updateProduct(id, formData);
      } else {
        savedProduct = await productService.createProduct(formData);

        // Upload additional gallery images for newly created product
        for (const item of additionalFiles) {
          if (item.file) {
            const imgData = new FormData();
            imgData.append('image', item.file);
            imgData.append('alt_text', form.name || 'Product Image');
            await productService.addProductImage(savedProduct.id, imgData);
          }
        }

        // Save new variants
        for (const v of variants) {
          if (v.name) {
            await productService.addProductVariant(savedProduct.id, v);
          }
        }
      }

      // If editing, also upload any newly added gallery files
      if (isEdit) {
        for (const item of additionalFiles) {
          if (item.file) {
            const imgData = new FormData();
            imgData.append('image', item.file);
            imgData.append('alt_text', form.name || 'Product Image');
            await productService.addProductImage(savedProduct.id || id, imgData);
          }
        }
      }

      navigate('/seller/products');
    } catch (err) {
      setError(
        err.response?.data?.sku?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        'Failed to save product. Please check required fields.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading product form...</div>;
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/seller/products" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {imageError && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{imageError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            Basic Information
          </h3>

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Noise Cancelling Over-Ear Headphones"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent ? `— ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. SoundWave, UrbanStitch"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description (Key Highlights)</label>
            <input
              type="text"
              placeholder="e.g. 40dB Hybrid ANC with 50-hour ultra battery life."
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Full product specifications, materials, warranty, and included items..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Product Imagery (Main & Additional Gallery Images) */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Product Imagery</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Upload clear, realistic product photos. Supported formats: JPG, PNG, WEBP (Max: 5MB per file).
              </p>
            </div>
          </div>

          {/* Main Cover Image */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Main Product Image (Cover / Listing Thumbnail) *
            </label>

            {thumbnailPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', backgroundColor: '#FFFFFF', maxWidth: '420px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0, backgroundColor: 'var(--bg-tertiary)' }}>
                  <img
                    src={thumbnailPreview}
                    alt="Main product preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {thumbnailFile ? thumbnailFile.name : 'Cover image uploaded'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="btn btn-secondary btn-sm"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="btn btn-sm"
                      style={{ color: 'var(--danger)', border: '1px solid var(--danger-border, #FCA5A5)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)',
                  transition: 'border-color 0.2s',
                  maxWidth: '420px',
                }}
              >
                <UploadCloud size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                  Click to upload main product photo
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  JPG, PNG, or WEBP up to 5MB
                </div>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={handleThumbnailChange}
            />
          </div>

          {/* Additional Gallery Images */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                Additional Gallery Photos (Side views, packaging, wearing angle)
              </label>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={14} />
                Add Photos
              </button>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={handleAdditionalImagesChange}
            />

            {additionalFiles.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {additionalFiles.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '100%',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <img
                      src={item.preview}
                      alt={`Gallery preview ${idx + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '0.35rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(idx)}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.25rem',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                No extra gallery images added yet. Click "+ Add Photos" above to showcase multiple angles.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Pricing & Inventory */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            Pricing & Stock
          </h3>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">MRP Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2999.00"
                value={form.price}
                onChange={(e) => handlePriceChange(e.target.value, form.discount_price)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Price (Selling Price ₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="1999.00"
                value={form.discount_price}
                onChange={(e) => handlePriceChange(form.price, e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount %</label>
              <input
                type="text"
                disabled
                value={`${form.discount_percentage}% OFF`}
                style={{ backgroundColor: 'var(--bg-tertiary)', fontWeight: 700, color: 'var(--success)' }}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Order Qty</label>
              <input
                type="number"
                min="1"
                value={form.minimum_order_quantity}
                onChange={(e) => setForm({ ...form, minimum_order_quantity: parseInt(e.target.value, 10) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Variants (Size, Color, Storage, etc.) */}
        {!isEdit && (
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Configurable Variants (Optional)
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No variants added. Useful for sizes (M, L, XL), colors, or storage options.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {variants.map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <select
                      value={v.variant_type}
                      onChange={(e) => handleVariantChange(idx, 'variant_type', e.target.value)}
                      style={{ width: '130px' }}
                    >
                      <option value="Size">Size</option>
                      <option value="Color">Color</option>
                      <option value="Storage">Storage</option>
                      <option value="RAM">RAM</option>
                      <option value="Weight">Weight</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Variant Name (e.g. XL, 256GB)"
                      value={v.name}
                      onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                      style={{ flexGrow: 1 }}
                    />

                    <input
                      type="number"
                      step="0.01"
                      placeholder="+₹ Price Adj"
                      value={v.price_adjustment}
                      onChange={(e) => handleVariantChange(idx, 'price_adjustment', e.target.value)}
                      style={{ width: '120px' }}
                    />

                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock_quantity}
                      onChange={(e) => handleVariantChange(idx, 'stock_quantity', parseInt(e.target.value, 10) || 0)}
                      style={{ width: '90px' }}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      style={{ color: 'var(--danger)', padding: '0.4rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Link to="/seller/products" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            <Save size={18} />
            {submitting ? 'Saving Product...' : isEdit ? 'Update Product' : 'Create & Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};
