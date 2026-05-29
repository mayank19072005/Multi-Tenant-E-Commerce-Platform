'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '../services/productService';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMockProducts = () => [
    {
      _id: 'mock-1',
      title: 'iPhone 15',
      description: 'Apple phone with dynamic island and high-res camera.',
      price: 999,
      stock: 10,
      category: 'Phones',
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80']
    },
    {
      _id: 'mock-2',
      title: 'MacBook Pro',
      description: 'Premium Apple laptop powered by M-series processor.',
      price: 1999,
      stock: 5,
      category: 'Laptops',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80']
    },
    {
      _id: 'mock-3',
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      if (data?.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts(getPersistentProducts());
      }
    } catch (err) {
      console.warn('Backend server offline. Displaying local demo catalog items.', err.message);
      setProducts(getPersistentProducts());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 w-full animate-pulse rounded-3xl bg-slate-200/60 mb-12"></div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="h-48 w-full rounded-xl bg-slate-200/70 mb-4"></div>
              <div className="h-6 w-2/3 rounded bg-slate-200/70 mb-2"></div>
              <div className="h-4 w-full rounded bg-slate-200/70 mb-4"></div>
              <div className="h-5 w-1/4 rounded bg-slate-200/70"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Catalog</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={fetchProducts} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white shadow-xl shadow-slate-100 mb-12 sm:px-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-violet-500/20 to-transparent"></div>
        <div className="relative max-w-xl">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-400/20 mb-6">
            Introducing AuraCart 2026
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
            Elevate Your Digital Commerce
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Experience lightning-fast performance, localized multi-tenant environments, and gorgeous shopping experiences designed for modern brands.
          </p>
        </div>
      </div>

      {/* Catalog Grid Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Listings</h2>
          <p className="text-sm text-slate-500">Discover handpicked premium products curated for you</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600">
          {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
        </span>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-12 w-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25-3v13.5m0-13.5L18.75 6.75M12 4.5 5.25 6.75" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Catalog Empty</h3>
          <p className="text-sm text-slate-400">There are no products active on this tenant at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md"
            >
              {/* Product Image Panel */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">No Image</div>
                )}
                {product.category && (
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-100/50">
                    {product.category}
                  </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="flex flex-grow flex-col p-6">
                <h3 className="text-lg font-bold text-slate-800 transition-colors duration-200 group-hover:text-indigo-600">
                  {product.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                  {product.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <span className="text-2xl font-black text-indigo-600">${product.price}</span>
                  <Link
                    href={`/product/${product._id}`}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-50 px-4 text-xs font-bold text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
