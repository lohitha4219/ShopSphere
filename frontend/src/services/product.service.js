import api from './api';

// ==========================================
// PRODUCT CACHE
// ==========================================

// ShopSphere currently has 75 products.
// Cache the HomePage product request for 1 minute.
const PRODUCTS_CACHE_TIME = 60 * 1000;

let productsCache = null;
let productsCacheTime = 0;


// ==========================================
// PRODUCT SERVICE
// ==========================================

export const productService = {

  // ----------------------------------------
  // Get Products
  // ----------------------------------------
  async getProducts(params = {}) {

    // Cache only the HomePage request
    // /products/?page_size=100
    const isHomeRequest =
      Object.keys(params).length === 1 &&
      Number(params.page_size) === 100;

    // Return cached products if cache is still valid
    if (
      isHomeRequest &&
      productsCache &&
      Date.now() - productsCacheTime < PRODUCTS_CACHE_TIME
    ) {
      return productsCache;
    }

    const response = await api.get('/products/', { params });

    // Save HomePage products in cache
    if (isHomeRequest) {
      productsCache = response.data;
      productsCacheTime = Date.now();
    }

    return response.data;
  },


  // ----------------------------------------
  // Get Single Product
  // ----------------------------------------
  async getProduct(slugOrId) {
    const response = await api.get(`/products/${slugOrId}/`);
    return response.data;
  },


  // ----------------------------------------
  // Get Brands
  // ----------------------------------------
  async getBrands() {
    const response = await api.get('/products/brands/');
    return response.data;
  },


  // ----------------------------------------
  // Get Featured Products
  // ----------------------------------------
  async getFeatured() {
    const response = await api.get('/products/featured/');
    return response.data.results || response.data;
  },


  // ----------------------------------------
  // Get Deals
  // ----------------------------------------
  async getDeals() {
    const response = await api.get('/products/deals/');
    return response.data.results || response.data;
  },


  // ----------------------------------------
  // Get Best Sellers
  // ----------------------------------------
  async getBestSellers() {
    const response = await api.get('/products/best_sellers/');
    return response.data.results || response.data;
  },


  // ----------------------------------------
  // Get Similar Products
  // ----------------------------------------
  async getSimilar(slugOrId) {
    const response = await api.get(
      `/products/${slugOrId}/similar/`
    );

    return response.data.results || response.data;
  },


  // ----------------------------------------
  // Create Product
  // ----------------------------------------
  async createProduct(productData) {
    const response = await api.post(
      '/products/',
      productData
    );

    // Clear cache because product data changed
    productsCache = null;
    productsCacheTime = 0;

    return response.data;
  },


  // ----------------------------------------
  // Update Product
  // ----------------------------------------
  async updateProduct(slugOrId, productData) {
    const response = await api.put(
      `/products/${slugOrId}/`,
      productData
    );

    // Clear cache because product data changed
    productsCache = null;
    productsCacheTime = 0;

    return response.data;
  },


  // ----------------------------------------
  // Delete Product
  // ----------------------------------------
  async deleteProduct(slugOrId) {
    const response = await api.delete(
      `/products/${slugOrId}/`
    );

    // Clear cache because product data changed
    productsCache = null;
    productsCacheTime = 0;

    return response.data;
  },


  // ----------------------------------------
  // Add Product Image
  // ----------------------------------------
  async addProductImage(productId, formData) {
    const response = await api.post(
      `/products/${productId}/add_image/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Clear cache because product image changed
    productsCache = null;
    productsCacheTime = 0;

    return response.data;
  },


  // ----------------------------------------
  // Add Product Variant
  // ----------------------------------------
  async addProductVariant(productId, variantData) {
    const response = await api.post(
      `/products/${productId}/add_variant/`,
      variantData
    );

    // Clear cache because product variant changed
    productsCache = null;
    productsCacheTime = 0;

    return response.data;
  },
};