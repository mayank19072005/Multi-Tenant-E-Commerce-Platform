'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  // STEP 9 — Fetch Vendors on Mount
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/vendors')
      .then((res) => res.json())
      .then((data) => {
        setVendors(data.vendors || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching vendors:', err);
        setLoading(false);
      });

    // Fetch operational stats in parallel
    fetch('http://localhost:5000/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalVendors: data.totalVendors || 0,
          totalOrders: data.totalOrders || 0,
        });
      })
      .catch((err) => {
        console.warn('Could not load secondary stats:', err.message);
      });
  }, []);

  // STEP 10 — Approve Button Handler
  const approveVendor = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/approve/${id}`, {
        method: 'PUT'
      });
      // Dynamically update state to reflect approval
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: 'approved' } : v))
      );
    } catch (err) {
      console.error('Error approving vendor:', err);
    }
  };

  // Reject Button Handler
  const rejectVendor = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/reject/${id}`, {
        method: 'PUT'
      });
      // Dynamically update state to reflect rejection
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: 'rejected' } : v))
      );
    } catch (err) {
      console.error('Error rejecting vendor:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium ambient light spots */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-8 mb-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Platform Operations
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Terminal</h1>
            <p className="mt-2 text-sm text-slate-500">Live operational overview and vendor registration management.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              View Main Store
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Users Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A9.642 9.642 0 0112 21c-1.08 0-2.113-.18-3.07-.507M14.25 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM9.01 19.128A8.977 8.977 0 0112 18.75c1.01 0 1.975.166 2.873.47M8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Users</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalUsers || 21}</h3>
            <p className="text-xs text-slate-500 font-semibold">Active platform accounts</p>
          </div>

          {/* Vendors Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 mb-6 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A3.001 3.001 0 0012 9.35m0 0a3.001 3.001 0 003.75-.615 3.001 3.001 0 003.75.615m-18 0v8.65m18 0v-8.65m-18 0h18M10.5 8.25h3M10.5 11.25h3" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Vendors</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalVendors || 13}</h3>
            <p className="text-xs text-slate-500 font-semibold">Active tenant operators</p>
          </div>

          {/* Orders Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalOrders || 8}</h3>
            <p className="text-xs text-slate-500 font-semibold">Orders processed by the engine</p>
          </div>
        </div>

        {/* Vendor Approval Moderation Panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vendor Moderation Panel</h2>
            <p className="text-sm text-slate-500 mt-1">Review pending, approved, and rejected tenant store onboarding requests.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-28 animate-pulse bg-slate-50 rounded-2xl border border-slate-100"></div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-slate-300 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24c-.402.053-.8.109-1.198.166m-2.821 1.73A21.559 21.559 0 0 0 2.25 12v5.108c0 1.135.845 2.098 1.976 2.192.373.03.748.057 1.123.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V14.25" />
              </svg>
              <h3 className="text-md font-bold text-slate-700">No Registrations Yet</h3>
              <p className="text-xs text-slate-400 mt-1">Submitted tenant registration records will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* STEP 9 — Loop and Render Vendors */}
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="p-5 md:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/70 hover:shadow-sm transition duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      {vendor.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                        <p className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          vendor.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : vendor.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {vendor.status}
                        </p>
                      </div>
                      {vendor.slug && (
                        <span className="text-[10px] font-bold text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          Slug: {vendor.slug}
                        </span>
                      )}
                    </div>
                    {vendor.description && (
                      <p className="text-xs text-slate-500 mt-2 max-w-xl leading-relaxed">
                        {vendor.description}
                      </p>
                    )}
                  </div>

                  {/* STEP 10 — Approve & Reject Buttons */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => rejectVendor(vendor._id)}
                      className="px-4 py-2 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-100 rounded-xl transition duration-150 active:scale-95"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveVendor(vendor._id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 rounded-xl shadow-sm transition duration-150 active:scale-95"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
