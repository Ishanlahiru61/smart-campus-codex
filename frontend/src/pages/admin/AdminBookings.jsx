import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Search, CheckCircle, XCircle, Trash2,
  Loader2, X, Clock, Eye, Filter, RefreshCw,
} from 'lucide-react';
import { bookingAPI } from '../../services/bookingApi';
import { toast } from 'react-toastify';

// ── Constants ─────────────────────────────────────────────────
const ALL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const STATUS_STYLE = {
  PENDING:   'bg-amber-50 text-amber-700',
  APPROVED:  'bg-emerald-50 text-emerald-700',
  REJECTED:  'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

// ── Booking Manage Modal ───────────────────────────────────────
function ManageBookingModal({ booking, onClose, onStatusChange }) {
  const [step, setStep] = useState('view');   // 'view' | 'confirm_approve' | 'confirm_reject'
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Must declare all hooks before any conditional return
  const fmt = (dt) =>
    dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const handleApprove = async () => {
    setSaving(true);
    try {
      await bookingAPI.approve(booking.id);
      toast.success('Booking approved successfully');
      onStatusChange(booking.id, 'APPROVED', null);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve booking');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please enter a rejection reason');
      return;
    }
    setSaving(true);
    try {
      await bookingAPI.reject(booking.id, rejectReason.trim());
      toast.success('Booking rejected');
      onStatusChange(booking.id, 'REJECTED', rejectReason.trim());
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject booking');
    } finally {
      setSaving(false);
    }
  };

  if (!booking) return null;

  const isPending = booking.status === 'PENDING';

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        key="manage-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Manage Booking</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[booking.status]}`}>
                {booking.status}
              </span>
              <span className="text-xs font-mono text-slate-400">#{booking.id?.slice(-8)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Details ── */}
        <div className="px-8 py-5 space-y-0">
          {[
            ['Facility', booking.facility?.name || '—'],
            ['Location', booking.facility?.location || '—'],
            ['Purpose', booking.purpose || '—'],
            ['Attendees', booking.attendees ?? '—'],
            ['Start Time', fmt(booking.startTime)],
            ['End Time', fmt(booking.endTime)],
            ['Created', fmt(booking.createdAt)],
            ...(booking.rejectionReason ? [['Rejection Reason', booking.rejectionReason]] : []),
          ].map(([label, val]) => (
            <div key={label} className="flex gap-4 py-3 border-b border-slate-50 last:border-0">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 w-32 shrink-0 pt-0.5">
                {label}
              </span>
              <span className="text-sm font-semibold text-slate-800">{val}</span>
            </div>
          ))}
        </div>

        {/* ── Action Area ── */}
        <div className="px-8 pb-8 pt-2">
          {/* Always show status actions */}
          {step === 'view' && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Change Status</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('confirm_approve')}
                  className="py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setStep('confirm_reject')}
                  className="py-3.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-3 py-2.5 bg-white hover:bg-slate-100 text-slate-500 rounded-xl text-sm font-bold border border-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Confirm Approve Step */}
          {step === 'confirm_approve' && (
            <div className="bg-emerald-50 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-bold text-emerald-800">
                ✅ Confirm approval of this booking?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('view')}
                  disabled={saving}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Yes, Approve
                </button>
              </div>
            </div>
          )}

          {/* Confirm Reject Step */}
          {step === 'confirm_reject' && (
            <div className="bg-red-50 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-bold text-red-800">❌ Rejection reason (required):</p>
              <textarea
                rows={3}
                autoFocus
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Facility is unavailable at this time..."
                className="w-full bg-white border border-red-200 focus:border-red-400 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-300 placeholder-slate-400 resize-none transition-all"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('view'); setRejectReason(''); }}
                  disabled={saving}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleReject}
                  disabled={saving || !rejectReason.trim()}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <XCircle className="w-4 h-4" />}
                  Yes, Reject
                </button>
              </div>
            </div>
          )}

          {/* Non-pending: just close */}
          {step === 'view' && null}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminBookings() {
  const [bookings, setBookings]     = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [managing, setManaging]     = useState(null);   // booking object opened in modal
  const [deletingId, setDeletingId] = useState(null);

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

  // Called by modal after successful API call — updates local state in-place
  const handleStatusChange = (id, newStatus, rejectionReason) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status: newStatus, rejectionReason: rejectionReason ?? b.rejectionReason }
          : b
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      setDeletingId(id);
      await bookingAPI.delete(id);
      setBookings(prev => prev.filter(b => b.id !== id));
      toast.success('Booking deleted');
    } catch {
      toast.error('Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      b.id?.toLowerCase().includes(q) ||
      b.userId?.toLowerCase().includes(q) ||
      b.facility?.name?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const fmt = (dt) =>
    dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Booking Management
          </h1>
          <p className="text-slate-500 font-medium mt-2">Review, approve, and manage facility bookings</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { label: 'Total',     value: bookings.length,          icon: '📋', color: 'text-slate-800' },
          { label: 'Pending',   value: counts.PENDING   || 0,    icon: '⏳', color: 'text-amber-700' },
          { label: 'Approved',  value: counts.APPROVED  || 0,    icon: '✅', color: 'text-emerald-700' },
          { label: 'Rejected',  value: counts.REJECTED  || 0,    icon: '❌', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6">
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by purpose, booking ID, user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', ...ALL_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                filterStatus === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <p className="text-sm font-semibold text-slate-400 shrink-0">
          {filtered.length} of {bookings.length}
        </p>
      </div>

      {/* ── Table ── */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Booking', 'Facility', 'Purpose', 'Start Time', 'End Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    {/* Booking ID */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-400">#{b.id?.slice(-8)}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{b.userId}</span>
                      </div>
                    </td>

                    {/* Facility */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {b.facility?.imageUrl ? (
                          <img
                            src={b.facility.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 line-clamp-1">
                            {b.facility?.name || 'Unknown Facility'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                            {b.facility?.location || 'No location'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-[160px]">
                        {b.purpose || '—'}
                      </span>
                    </td>

                    {/* Start */}
                    <td className="px-6 py-5 text-xs font-semibold text-slate-500">{fmt(b.startTime)}</td>

                    {/* End */}
                    <td className="px-6 py-5 text-xs font-semibold text-slate-500">{fmt(b.endTime)}</td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${STATUS_STYLE[b.status] || ''}`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        {/* Manage button — opens modal for ALL statuses */}
                        <button
                          onClick={() => setManaging(b)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title={b.status === 'PENDING' ? 'Manage booking' : 'View details'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick-action Approve (table shortcut) */}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => setManaging(b)}
                            className="px-3 py-1.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
                            title="Manage"
                          >
                            Manage
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={!!deletingId}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === b.id
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

      {/* ── Manage Modal ── */}
      <AnimatePresence>
        {managing && (
          <ManageBookingModal
            key={managing.id}
            booking={managing}
            onClose={() => setManaging(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
