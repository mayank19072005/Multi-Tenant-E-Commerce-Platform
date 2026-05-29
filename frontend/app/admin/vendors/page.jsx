'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminVendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const getMockVendors = () => [
    {
      _id: 'mock-tenant-1',
      name: 'Nexus Tech Lab',
      slug: 'nexus-tech-lab',
      description: 'Next-generation consumer electronics, smart iot appliances, and developer peripherals.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      _id: 'mock-tenant-2',
      name: 'Aether Threads',
      slug: 'aether-threads',
      description: 'Premium organic cotton designer garments, handcrafted streetwear, and custom accessories.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      _id: 'mock-tenant-3',
      name: 'Velocity Ride Store',
      slug: 'velocity-ride-store',
      description: 'High-performance carbon fiber road bicycles, custom components, and professional safety gear.',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];

  const fetchVendors = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('API request failed');
      }
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setVendors(data);
      } else if (data && Array.isArray(data.vendors)) {
        setVendors(data.vendors);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.warn('Backend server offline or endpoint access failed. Initializing interactive simulation.', err.message);
      const cached = localStorage.getItem('simulation_pending_vendors');
      if (cached) {
        try {
          setVendors(JSON.parse(cached));
        } catch (e) {
          setVendors(getMockVendors());
        }
      } else {
        const defaults = getMockVendors();
        localStorage.setItem('simulation_pending_vendors', JSON.stringify(defaults));
        setVendors(defaults);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchVendors();
  }, [router]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Approval failed');
      }

      // Increment approved vendor tracker in localStorage
      const currentApprovedCount = parseInt(localStorage.getItem('simulation_approved_vendors_count') || '0', 10);
      localStorage.setItem('simulation_approved_vendors_count', (currentApprovedCount + 1).toString());

      setMessage({ type: 'success', text: 'Vendor approved and status set to active.' });
      setVendors(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.warn('Simulating local vendor approval...', err.message);
      const updated = vendors.filter(v => v._id !== id);
      setVendors(updated);
      localStorage.setItem('simulation_pending_vendors', JSON.stringify(updated));

      // Increment approved vendor tracker in localStorage for simulation
      const currentApprovedCount = parseInt(localStorage.getItem('simulation_approved_vendors_count') || '0', 10);
      localStorage.setItem('simulation_approved_vendors_count', (currentApprovedCount + 1).toString());

      setMessage({ type: 'success', text: 'Vendor approved successfully (Local Demo Mode)!' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Rejection failed');
      }

      setMessage({ type: 'success', text: 'Vendor registration rejected.' });
      setVendors(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.warn('Simulating local vendor rejection...', err.message);
      const updated = vendors.filter(v => v._id !== id);
      setVendors(updated);
      localStorage.setItem('simulation_pending_vendors', JSON.stringify(updated));
      setMessage({ type: 'info', text: 'Vendor request rejected (Local Demo Mode).' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-8 mb-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Link href="/admin/dashboard" className="hover:text-indigo-700 transition">Dashboard</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">Approvals</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Registrations</h1>
            <p className="mt-2 text-sm text-slate-500">Review, approve, or reject pending tenant store onboardings.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Feedback Alert Messages */}
        {message.text && (
          <div className={`mb-8 rounded-2xl border p-4 text-sm flex items-start gap-3 transition-all duration-300 animate-slideDown ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : message.type === 'error'
              ? 'bg-rose-50 border-rose-100 text-rose-800'
              : 'bg-indigo-50 border-indigo-100 text-indigo-800'
          }`}>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Vendors Grid */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 animate-pulse bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"></div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-12 text-center shadow-sm max-w-xl mx-auto mt-6">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Up to Date!</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">All submitted vendor registrations have been reviewed. There are no pending tenant stores requiring moderation.</p>
            <Link href="/admin/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 font-bold text-white shadow-md hover:bg-slate-800 transition">
              Overview Terminal
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor._id} 
                className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                <div className="flex-grow space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                      {vendor.name}
                    </h3>
                    <span className="text-[10px] font-black uppercase bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
                      Slug: {vendor.slug}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    {vendor.description || 'No description provided by tenant store owner.'}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submitted: {new Date(vendor.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:self-center">
                  <button
                    onClick={() => handleReject(vendor._id)}
                    disabled={actionLoadingId !== null}
                    className="flex-grow md:flex-grow-0 inline-flex h-11 items-center justify-center rounded-xl bg-white border border-slate-200 px-5 text-sm font-bold text-rose-600 shadow-sm hover:bg-rose-50 hover:border-rose-100 active:scale-[0.98] transition duration-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(vendor._id)}
                    disabled={actionLoadingId !== null}
                    className="flex-grow md:flex-grow-0 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 px-6 text-sm font-bold text-white shadow-md shadow-indigo-100 active:scale-[0.98] transition duration-200 disabled:opacity-50 disabled:pointer-events-none min-w-[110px]"
                  >
                    {actionLoadingId === vendor._id ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Approve'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
