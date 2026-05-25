'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  // Helper to decode JWT token
  const parseJwt = (jwtToken) => {
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Read initial token on client mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      if (storedToken) {
        const decoded = parseJwt(storedToken);
        setRole(decoded?.role || null);
      } else {
        setRole(null);
      }
    }

    // Sync token state on custom storage events
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      if (storedToken) {
        const decoded = parseJwt(storedToken);
        setRole(decoded?.role || null);
      } else {
        setRole(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    router.push('/');
    // Trigger dynamic reload of components depending on auth state
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-200 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-7.5 0h7.5m-.75 0a3.001 3.001 0 0 0 3.75-.615m3.75.615a3.001 3.001 0 0 0 3.75-.615m-7.5 0h7.5m-.75 0V3.75m0 9.006 1.002-1.002a3.004 3.004 0 0 0 1.998-.615h.002"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                AuraCart
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Categories
              </Link>
              <Link
                href="#"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Vendors
              </Link>
              {token && role !== 'vendor' && (
                <Link
                  href="/orders"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Orders
                </Link>
              )}
              {token && role === 'vendor' && (
                <Link
                  href="/vendor/dashboard"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {token && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  1
                </span>
              )}
            </Link>

            {token ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
