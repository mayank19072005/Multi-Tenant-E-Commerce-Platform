'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCart } from '../../services/cartService';
import {
  loadStripe
} from '@stripe/stripe-js';
import {
  createCheckoutSession
} from '../../services/orderService';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Helper to decode JWT token without external libraries
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const getMockCart = () => ({
    items: [
      {
        _id: 'mock-cart-item-1',
        quantity: 1,
        product_id: {
          _id: 'mock-1',
          title: 'iPhone 15',
          price: 999,
          category: 'Phones',
          images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80'],
          description: 'Apple phone with dynamic island and high-res camera.'
        }
      },
      {
        _id: 'mock-cart-item-2',
        quantity: 2,
        product_id: {
          _id: 'mock-2',
          title: 'MacBook Pro',
          price: 1999,
          category: 'Laptops',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80'],
          description: 'Premium Apple laptop powered by M-series processor.'
        }
      }
    ]
  });

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      let storedToken = localStorage.getItem('token');
      let isCustomer = false;

      if (storedToken) {
        const decoded = parseJwt(storedToken);
        if (decoded && decoded.role === 'customer') {
          isCustomer = true;
        }
      }

      setToken(storedToken || 'simulation_token');

      if (isCustomer && storedToken) {
        fetchCart(storedToken);
      } else {
        // Automatically load simulation cart for guest/dev testing
        const cached = localStorage.getItem('simulation_cart');
        if (cached) {
          try {
            setCart(JSON.parse(cached));
          } catch (e) {
            setCart(getMockCart());
          }
        } else {
          const defaults = getMockCart();
          localStorage.setItem('simulation_cart', JSON.stringify(defaults));
          setCart(defaults);
        }
        setLoading(false);
      }
    }
  }, []);

  const fetchCart = async (authToken) => {
    try {
      setLoading(true);
      const data = await getCart(authToken);
      setCart(data.cart);
    } catch (err) {
      console.warn('Error fetching cart (offline fallback active):', err.message || err);
      // Retrieve locally saved simulation cart on any API connection or auth failure
      const cached = localStorage.getItem('simulation_cart');
      if (cached) {
        try {
          setCart(JSON.parse(cached));
        } catch (e) {
          setCart(getMockCart());
        }
      } else {
        const defaults = getMockCart();
        localStorage.setItem('simulation_cart', JSON.stringify(defaults));
        setCart(defaults);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
      );

      const products = cart.items
        .filter(item => item.product_id)
        .map(item => ({
          product_id: item.product_id._id,
          quantity: item.quantity
        }));

      const data = await createCheckoutSession(
        products,
        token
      );

      await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Helper to compute subtotal
  const getSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => {
      const product = item.product_id;
      if (!product) return acc;
      return acc + (product.price * (item.quantity || 1));
    }, 0);
  };

  const subtotal = getSubtotal();
  const tax = 0; // Free tax
  const shipping = 0; // Free shipping
  const total = subtotal;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="flex gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-24 w-24 rounded-xl bg-slate-200"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 w-1/3 rounded bg-slate-200"></div>
                  <div className="h-4 w-1/4 rounded bg-slate-200"></div>
                  <div className="h-4 w-1/6 rounded bg-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-slate-50 p-6 animate-pulse space-y-4 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-8">Please login to view your personalized shopping cart.</p>
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 font-semibold text-white shadow-md transition hover:bg-slate-800">
          Back to Storefront
        </Link>
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
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Cart</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={() => fetchCart(token)} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition">
          Try Again
        </button>
      </div>
    );
  }

  const cartItems = cart?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Shopping Cart</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your premium multi-tenant product listings before checking out</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-500 bg-slate-50/30">
          <div className="mx-auto h-16 w-16 text-slate-400 mb-6 flex items-center justify-center rounded-2xl bg-slate-100/80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h3>
          <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">Looks like you haven't added any products to your cart yet. Visit our store to find premium deals.</p>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-500">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {cartItems.map((item, idx) => {
                const product = item.product_id;
                if (!product) return null; // Graceful skip for deleted product records

                return (
                  <div key={item._id || idx} className="flex py-8 gap-6 sm:gap-8 items-center">
                    {/* Image display */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="max-h-full object-contain transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">No image</span>
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="flex flex-1 flex-col sm:flex-row sm:justify-between sm:gap-6">
                      <div className="flex-1">
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-100/50 mb-1.5">
                          {product.category || 'Product'}
                        </span>
                        <h2 className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition">
                          <Link href={`/product/${product._id}`}>{product.title}</Link>
                        </h2>
                        {product.description && (
                          <p className="mt-1 text-xs text-slate-400 line-clamp-1 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-slate-500 font-medium">
                          Quantity: <span className="font-bold text-slate-700">{item.quantity || 1}</span>
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end justify-between">
                        <span className="text-xl font-black text-indigo-600">
                          ${(product.price * (item.quantity || 1)).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          ${product.price} each
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary Panel */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-transparent to-transparent opacity-60 pointer-events-none"></div>

              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-4 relative z-10">Order Summary</h2>

              <div className="mt-6 space-y-4 relative z-10">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-slate-800">Included</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Shipping Cost</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>

                <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-black text-indigo-600">${total.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-8 w-full flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-md shadow-indigo-100 transition-all duration-200 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] relative z-10"
              >
                Checkout
              </button>

              <div className="mt-4 text-center relative z-10">
                <Link href="/" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
