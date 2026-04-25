import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { userBookingAPI } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const STATUS_STYLE = {
  PENDING:   'bg-amber-50 text-amber-700',
  APPROVED:  'bg-emerald-50 text-emerald-700',
  REJECTED:  'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const STATUS_ICONS = {
  PENDING:   <Clock className="w-3.5 h-3.5" />,
  APPROVED:  <CheckCircle className="w-3.5 h-3.5" />,
  REJECTED:  <XCircle className="w-3.5 h-3.5" />,
  CANCELLED: <X className="w-3.5 h-3.5" />,
};

export default function UserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await userBookingAPI.getMyBookings();
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      setCancellingId(id);
      const updated = await userBookingAPI.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast.success('Booking cancelled');
    } catch { toast.error('Failed to cancel booking'); }
    finally { setCancellingId(null); }
  };

  const filtered = !filterStatus ? bookings : bookings.filter(b => b.status === filterStatus);
  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const counts = bookings.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a; }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" /> My Bookings
        </h1>
        <p className="text-slate-500 font-medium mt-2">Track and manage your facility booking requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { label: 'Total', value: bookings.length, icon: '📋', color: 'text-slate-800' },
          { label: 'Pending', value: counts.PENDING || 0, icon: '⏳', color: 'text-amber-700' },
          { label: 'Approved', value: counts.APPROVED || 0, icon: '✅', color: 'text-emerald-700' },
          { label: 'Rejected', value: counts.REJECTED || 0, icon: '❌', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6">
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              filterStatus === s
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-500 hover:text-slate-800 shadow-[0_4px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)]'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] text-slate-400 border border-dashed border-slate-200">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="text-xl font-extrabold text-slate-800">No bookings found</p>
          <p className="text-sm font-medium opacity-60 mt-2">Browse facilities to make your first booking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 rounded-[24px] px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 border-0 group">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${STATUS_STYLE[b.status]}`}>
                    {STATUS_ICONS[b.status]} {b.status}
                  </span>
                  <span className="text-xs font-black tracking-widest text-slate-300 uppercase">{b.attendees} attendees</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{b.purpose}</h3>
                <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">🕐 {fmt(b.startTime)}</span>
                  <span className="text-slate-300">→</span>
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">{fmt(b.endTime)}</span>
                </div>
                {b.rejectionReason && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-red-100">
                    <XCircle className="w-3.5 h-3.5" /> Reason: {b.rejectionReason}
                  </p>
                )}
              </div>
              {b.status === 'PENDING' && (
                <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}
                  className="shrink-0 px-6 py-3 text-xs font-black tracking-widest text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-sm uppercase">
                  {cancellingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Cancel Booking
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
