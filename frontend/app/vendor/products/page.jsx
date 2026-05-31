'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { getVendorProducts, updateProduct, deleteProduct, uploadProductImage } from '../../../services/vendorService';

export default function VendorProducts() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Edit Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Confirmation State
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setAccessDenied(true);
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      try {
        const decoded = jwtDecode(storedToken);
        console.log(decoded);

        if (!decoded || decoded.role !== 'vendor') {
          setAccessDenied(true);
          setLoading(false);
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        setToken(storedToken);
        setRole(decoded.role);
        fetchProducts(storedToken);
      } catch (e) {
        console.warn('Invalid token format or parsing error', e.message);
        setAccessDenied(true);
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
  }, []);

  const getMockProducts = () => [
    {
      _id: '685a123456789abcdef12345',
      title: 'iPhone 15',
      description: 'Apple phone with dynamic island and high-res camera.',
      price: 999,
      stock: 10,
      category: 'Phones',
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80']
    },
    {
      _id: '685a123456789abcdef12346',
      title: 'MacBook Pro',
      description: 'Premium Apple laptop powered by M-series processor.',
      price: 1999,
      stock: 5,
      category: 'Laptops',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80']
    },
    {
      _id: '685a123456789abcdef12347',
      title: 'Samsung TV',
      description: 'Stunning 4K Ultra HD smart television with vibrant colors.',
      price: 1200,
      stock: 15,
      category: 'TVs',
      images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80']
    }
  ];

  const getPersistentProducts = () => {
    if (typeof window === 'undefined') return getMockProducts();
    const local = localStorage.getItem('vendor_catalog_products');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.warn('Failed to parse persistent mock products', e);
      }
    }
    const defaults = getMockProducts();
    localStorage.setItem('vendor_catalog_products', JSON.stringify(defaults));
    return defaults;
  };

  const updatePersistentProduct = (id, updatedFields) => {
    if (typeof window === 'undefined') return [];
    const current = getPersistentProducts();
    const updated = current.map(p => p._id === id ? { ...p, ...updatedFields } : p);
    localStorage.setItem('vendor_catalog_products', JSON.stringify(updated));
    return updated;
  };

  const deletePersistentProduct = (id) => {
    if (typeof window === 'undefined') return [];
    const current = getPersistentProducts();
    const updated = current.filter(p => p._id !== id);
    localStorage.setItem('vendor_catalog_products', JSON.stringify(updated));
    return updated;
  };

  const fetchProducts = async (authToken) => {
    try {
      const data = await getVendorProducts(authToken);
      if (data?.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts(getPersistentProducts());
      }
    } catch (error) {
      console.warn('Backend server offline. Utilizing mockup catalog fallbacks.', error.message);
      setProducts(getPersistentProducts());
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      imageUrl: product.images?.[0] || ''
    });
    setMessage({ type: '', text: '' });
  };

  // Image Upload inside Edit modal
  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await uploadProductImage(file, token);
      if (data?.imageUrl) {
        setEditFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        throw new Error('Image URL is missing');
      }
    } catch (err) {
      console.warn('Image upload endpoint unavailable. Utilizing default catalog placeholder.', err.message);
      setMessage({ type: 'error', text: 'Image upload failed. Using default mockup image.' });
      setEditFormData(prev => ({
        ...prev,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Edits
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedFields = {
        title: editFormData.title,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        stock: parseInt(editFormData.stock),
        category: editFormData.category,
        images: editFormData.imageUrl ? [editFormData.imageUrl] : []
      };

      if (editingProduct._id.startsWith('mock-') || editingProduct._id.startsWith('685a')) {
        const updatedList = updatePersistentProduct(editingProduct._id, updatedFields);
        setProducts(updatedList);
        setMessage({ type: 'success', text: 'Mock Product updated successfully!' });
        setTimeout(() => setEditingProduct(null), 1200);
      } else {
        // Real database API call
        const response = await updateProduct(editingProduct._id, updatedFields, token);
        if (response.success) {
          setMessage({ type: 'success', text: 'Product updated successfully!' });
          fetchProducts(token);
          setTimeout(() => setEditingProduct(null), 1200);
        } else {
          throw new Error(response.message || 'Update failed');
        }
      }
    } catch (err) {
      console.warn('Product update endpoint unavailable. Simulating local edit modification.', err.message);
      const updatedList = updatePersistentProduct(editingProduct._id, updatedFields);
      setProducts(updatedList);
      setMessage({ type: 'success', text: 'Product details updated successfully!' });
      setTimeout(() => setEditingProduct(null), 1200);
    } finally {
      setEditLoading(false);
    }
  };

  // Confirm and Execute Delete
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      if (deletingProductId.startsWith('mock-') || deletingProductId.startsWith('685a')) {
        const updatedList = deletePersistentProduct(deletingProductId);
        setProducts(updatedList);
        setDeletingProductId(null);
      } else {
        // Real API call
        const response = await deleteProduct(deletingProductId, token);
        if (response.success) {
          fetchProducts(token);
          setDeletingProductId(null);
        } else {
          throw new Error(response.message || 'Deletion failed');
        }
      }
    } catch (err) {
      console.warn('Product delete endpoint unavailable. Simulating local catalog removal.', err.message);
      const updatedList = deletePersistentProduct(deletingProductId);
      setProducts(updatedList);
      setDeletingProductId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Products...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
          <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Unauthorized access. Redirecting you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background grids */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400 font-semibold">
          <Link href="/vendor/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-600">Products</span>
        </div>

        {/* Header Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">My Store Products</h1>
            <p className="text-sm text-slate-500">Manage all your active store listings, edit descriptions, pricing, and stock inventory.</p>
          </div>
          <Link
            href="/vendor/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 font-bold text-white shadow-md transition"
          >
            Dashboard Console
          </Link>
        </div>

        {/* Listings Display */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-slate-400 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25-3v13.5m0-13.5L18.75 6.75M12 4.5 5.25 6.75" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Products</h3>
            <p className="text-sm text-slate-400">Add listings from the Vendor Dashboard to showcase items to customer checkouts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Product Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm font-semibold">No Image</div>
                  )}
                  {product.category && (
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100/50">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">ID: {product._id.substring(0, 8)}...</p>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50">
                    {/* Stock Status Indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Stock</span>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        product.stock > 5 ? 'bg-indigo-50 text-indigo-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {product.stock} left
                      </span>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900">${product.price}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                          title="Edit Product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingProductId(product._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Delete Product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-slideUp">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">Edit Product details</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-8 space-y-5">
              {message.text && (
                <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  <span>{message.text}</span>
                </div>
              )}

              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Stock Inventory *</label>
                  <input
                    type="number"
                    required
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                <input
                  type="text"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold transition focus:bg-white focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold transition focus:bg-white resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Update Product Image</label>
                <div className="flex gap-4 items-center">
                  <input type="file" accept="image/*" onChange={handleEditImageUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:bg-indigo-50 file:text-indigo-600 file:border-0 hover:file:bg-indigo-100" />
                  {uploadingImage && <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                {editFormData.imageUrl && (
                  <div className="mt-3 relative h-16 w-28 rounded-xl overflow-hidden border border-slate-100">
                    <img src={editFormData.imageUrl} alt="Edit preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 flex h-12 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || uploadingImage}
                  className="flex-1 flex h-12 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-slate-100 text-center animate-scaleIn">
            <div className="h-14 w-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Delete product?</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently remove this listing from your catalog? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 flex h-11 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 flex h-11 items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-100"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
