'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalOrders: 0 });
  const [analytics, setAnalytics] = useState({ monthlyRevenue: 0, topProducts: [], topVendors: [] });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const getLocalStats = () => {
    if (typeof window === 'undefined') return { totalUsers: 21, totalVendors: 13, totalOrders: 8 };
    const approvedCount = parseInt(localStorage.getItem('simulation_approved_vendors_count') || '0', 10);
    return {
      totalUsers: 21 + approvedCount,
      totalVendors: 13 + approvedCount,
      totalOrders: 8
    };
  };

  const getLocalAnalytics = () => {
    return {
      monthlyRevenue: 45000,
      topProducts: [
        { name: 'iPhone 15', sales: 45, revenue: 44955 },
        { name: 'MacBook Pro', sales: 25, revenue: 49975 },
        { name: 'Samsung TV', sales: 18, revenue: 21600 },
        { name: 'Aura Earbuds', sales: 60, revenue: 9000 }
      ],
      topVendors: [
        { name: 'Tech Haven', sales: 70, revenue: 94930 },
        { name: 'Global Groceries', sales: 40, revenue: 12000 },
        { name: 'Skyline Tech', sales: 38, revenue: 18100 }
      ]
    };
  };

  useEffect(() => {
    setMounted(true);

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const token = localStorage.getItem('token');

    // 1. Fetch Stats
    fetch('http://localhost:5000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalVendors: data.totalVendors || 0,
          totalOrders: data.totalOrders || 0,
        });
      })
      .catch((err) => {
        console.warn('Backend server offline. Utilizing offline local stats tracker.', err.message);
        setStats(getLocalStats());
      });

    // 2. Fetch Analytics
    fetch('http://localhost:5000/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalytics({
          monthlyRevenue: data.monthlyRevenue || 0,
          topProducts: data.topProducts || [],
          topVendors: data.topVendors || []
        });
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend server offline. Utilizing offline local analytics tracker.', err.message);
        setAnalytics(getLocalAnalytics());
        setLoading(false);
      });
  }, [router]);

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
              Platform Management
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Live operational overview of the multi-tenant marketplace.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/admin/vendors" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24c-.402.053-.8.109-1.198.166m-2.821 1.73A21.559 21.559 0 002.25 12v5.108c0 1.135.845 2.098 1.976 2.192.373.03.748.057 1.123.08M15.75 18H18a2.25 2.25 0 002.25-2.25V14.25" />
              </svg>
              Review Registrations
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              View Main Store
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 animate-pulse bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Users Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110"></div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A9.642 9.642 0 0112 21c-1.08 0-2.113-.18-3.07-.507M14.25 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM9.01 19.128A8.977 8.977 0 0112 18.75c1.01 0 1.975.166 2.873.47M8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Users</p>
                <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalUsers}</h3>
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
                <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalVendors}</h3>
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
                <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalOrders}</h3>
                <p className="text-xs text-slate-500 font-semibold">Orders processed by the engine</p>
              </div>
            </div>

            {/* Visual Analytics & Charts Section */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Sales Bar Chart Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Top Selling Products</h3>
                  <p className="text-sm text-slate-500 mt-1">Platform-wide listing performance by sales volume.</p>
                </div>

                <div className="h-[300px] w-full pt-4">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            color: '#f8fafc',
                          }}
                          labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                        />
                        <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]}>
                          {analytics.topProducts.map((entry, index) => {
                            const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-slate-50/50 rounded-2xl flex items-center justify-center text-slate-400">
                      Loading Chart...
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard & Stats Side Panel */}
              <div className="space-y-8">
                {/* Monthly Revenue Banner */}
                <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md shadow-indigo-100/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/80 mb-1">Monthly Platform Revenue</p>
                  <h2 className="text-4xl font-black tracking-tight">${analytics.monthlyRevenue.toLocaleString()}</h2>
                  <p className="text-xs text-indigo-300 mt-4 flex items-center gap-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aggregated marketplace revenue
                  </p>
                </div>

                {/* Top Performing Tenants Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Top Performing Tenants</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Top stores rated by orders and sales.</p>
                  </div>

                  <div className="space-y-4">
                    {analytics.topVendors.map((vendor, index) => {
                      const rankColors = [
                        'bg-amber-50 text-amber-600 border-amber-100',
                        'bg-slate-100 text-slate-600 border-slate-200',
                        'bg-orange-50 text-orange-600 border-orange-100'
                      ];
                      return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50/60 transition duration-200">
                          <div className="flex items-center gap-3">
                            <span className={`h-8 w-8 rounded-xl border flex items-center justify-center font-bold text-sm ${rankColors[index % rankColors.length] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">{vendor.name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{vendor.sales} sales processed</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-indigo-600 text-sm">${vendor.revenue.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
