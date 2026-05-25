'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-8 text-center relative overflow-hidden">
        {/* Soft decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/30 via-transparent to-transparent pointer-events-none"></div>

        {/* Glow cancel circle */}
        <div className="relative mx-auto h-24 w-24 mb-6 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-inner animate-pulse">
          <div className="absolute inset-0 rounded-full bg-rose-100/40 animate-ping"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="h-12 w-12 relative z-10"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Cancel Metadata */}
        <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-600/10 mb-4">
          Payment Cancelled ❌
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
          Checkout Cancelled
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
          No charge was made. Your items are still saved in your shopping cart.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/cart"
            className="w-full flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-md hover:bg-indigo-500 transition duration-250 active:scale-[0.98]"
          >
            Return to Cart
          </Link>
          <Link
            href="/"
            className="w-full flex h-12 items-center justify-center rounded-xl bg-slate-50 px-6 font-semibold text-slate-600 hover:bg-slate-100 transition duration-250 active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
