import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { userBookingAPI } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const STATUS_STYLE = {
  PENDING:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  APPROVED:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED:  'bg-red-500/10 text-red-400 border-red-500/20',
  CANCELLED: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400" /> My Bookings
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Track and manage your facility booking requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: bookings.length, color: 'text-blue-400' },
          { label: 'Pending', value: counts.PENDING || 0, color: 'text-amber-400' },
          { label: 'Approved', value: counts.APPROVED || 0, color: 'text-emerald-400' },
          { label: 'Rejected', value: counts.REJECTED || 0, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3">
            <p className="text-neutral-500 text-xs">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-500">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[b.status]}`}>
                    {STATUS_ICONS[b.status]} {b.status}
                  </span>
                  <span className="text-xs text-neutral-500">{b.attendees} attendees</span>
                </div>
                <p className="font-medium text-white">{b.purpose}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  🕐 {fmt(b.startTime)} → {fmt(b.endTime)}
                </p>
                {b.rejectionReason && (
                  <p className="text-xs text-red-400 mt-1">Reason: {b.rejectionReason}</p>
                )}
              </div>
              {b.status === 'PENDING' && (
                <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                  {cancellingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Cancel
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
