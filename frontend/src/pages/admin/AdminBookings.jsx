import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, CheckCircle, XCircle, Trash2, Loader2, X, Clock, Eye } from 'lucide-react';
import { bookingAPI } from '../../services/bookingApi';
import { toast } from 'react-toastify';

const STATUS_STYLES = {
  PENDING:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  APPROVED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  REJECTED:  'bg-red-500/10 text-red-400 border border-red-500/20',
  CANCELLED: 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20',
};

const STATUS_ICONS = {
  PENDING:   <Clock className="w-3.5 h-3.5" />,
  APPROVED:  <CheckCircle className="w-3.5 h-3.5" />,
  REJECTED:  <XCircle className="w-3.5 h-3.5" />,
  CANCELLED: <X className="w-3.5 h-3.5" />,
};

function RejectModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setReason(''); }, [open]);

  const handleConfirm = async () => {
    if (!reason.trim()) { toast.warning('Please enter a rejection reason'); return; }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white mb-1">Reject Booking</h3>
        <p className="text-neutral-400 text-sm mb-4">Please provide a reason for rejection.</p>
        <textarea
          rows={3}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500 placeholder-neutral-500"
          placeholder="e.g. Facility unavailable at this time..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DetailModal({ booking, onClose }) {
  if (!booking) return null;
  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : 'N/A';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-white">Booking Details</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ['Booking ID', booking.id],
            ['Facility ID', booking.resourceId],
            ['User ID', booking.userId],
            ['Start Time', fmt(booking.startTime)],
            ['End Time', fmt(booking.endTime)],
            ['Attendees', booking.attendees],
            ['Purpose', booking.purpose],
            ['Status', booking.status],
            ['Rejection Reason', booking.rejectionReason || '—'],
            ['Created At', fmt(booking.createdAt)],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-3">
              <span className="text-neutral-500 w-36 shrink-0">{label}</span>
              <span className="text-white break-all">{val}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors">
          Close
        </button>
      </motion.div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingAPI.getAll();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id + '_approve');
      const updated = await bookingAPI.approve(id);
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast.success('Booking approved');
    } catch {
      toast.error('Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason) => {
    try {
      setActionLoading(rejectTarget + '_reject');
      const updated = await bookingAPI.reject(rejectTarget, reason);
      setBookings(prev => prev.map(b => b.id === rejectTarget ? updated : b));
      toast.success('Booking rejected');
    } catch {
      toast.error('Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      setActionLoading(id + '_delete');
      await bookingAPI.delete(id);
      setBookings(prev => prev.filter(b => b.id !== id));
      toast.success('Booking deleted');
    } catch {
      toast.error('Failed to delete booking');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.id?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.toLowerCase().includes(search.toLowerCase()) ||
      b.resourceId?.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          Booking Management
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Review, approve, and manage all facility bookings</p>
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

      {/* Filters */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by ID, user, facility or purpose..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-44"
        >
          <option value="">All Statuses</option>
          {['PENDING','APPROVED','REJECTED','CANCELLED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="text-sm text-neutral-500 shrink-0">{filtered.length} of {bookings.length}</p>
      </div>

      {/* Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-900/50 text-neutral-400 border-b border-neutral-700">
                <tr>
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Time Slot</th>
                  <th className="px-5 py-3 font-medium">Attendees</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filtered.map(b => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-700/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-white truncate max-w-[140px]" title={b.id}>
                        #{b.id?.slice(-8)}
                      </div>
                      <div className="text-xs text-neutral-500 truncate max-w-[140px]">{b.purpose || '—'}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs font-mono text-neutral-400 truncate max-w-[120px]" title={b.resourceId}>
                        {b.resourceId?.slice(-10) || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-neutral-300">{fmt(b.startTime)}</div>
                      <div className="text-xs text-neutral-500">→ {fmt(b.endTime)}</div>
                    </td>
                    <td className="px-5 py-3 text-neutral-300">{b.attendees}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] || ''}`}>
                        {STATUS_ICONS[b.status]}
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => setDetailTarget(b)}
                          className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve (only if PENDING) */}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === b.id + '_approve'
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <CheckCircle className="w-4 h-4" />}
                          </button>
                        )}

                        {/* Reject (only if PENDING) */}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => setRejectTarget(b.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={!!actionLoading}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {actionLoading === b.id + '_delete'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            open={!!rejectTarget}
            onClose={() => setRejectTarget(null)}
            onConfirm={handleReject}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailTarget && (
          <DetailModal booking={detailTarget} onClose={() => setDetailTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
