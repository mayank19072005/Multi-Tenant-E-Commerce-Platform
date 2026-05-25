'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-8 text-center relative overflow-hidden">
        {/* Soft decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-transparent to-transparent pointer-events-none"></div>

        {/* Glow checkmark circle */}
        <div className="relative mx-auto h-24 w-24 mb-6 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner animate-bounce">
          <div className="absolute inset-0 rounded-full bg-emerald-100/40 animate-ping"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="h-12 w-12 relative z-10"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        {/* Success Metadata */}
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/10 mb-4">
          Payment Successful ✅
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
          Thank you for your order!
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
          Your order has been placed successfully. A confirmation email with details has been sent.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 font-bold text-white shadow-md hover:bg-slate-800 transition duration-250 active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
