import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  X,
  Eye,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { bookingAPI } from '../../services/bookingApi';
import { toast } from 'react-toastify';

const ALL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const STATUS_STYLE = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const formatDate = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const formatTime = (dt) =>
  dt
    ? new Date(dt).toLocaleTimeString('en-LK', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '—';

const formatDateTime = (dt) =>
  dt
    ? new Date(dt).toLocaleString('en-LK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

function SchedulePills({ startTime, endTime, variant = 'table' }) {
  const boxClass =
    variant === 'modal'
      ? 'bg-white px-3 py-1.5 rounded-lg'
      : 'bg-slate-50 px-3 py-1.5 rounded-lg';

  return (
    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
      <span className={`inline-flex items-center gap-2 ${boxClass}`}>
        <Calendar className="w-3.5 h-3.5" />
        {formatDate(startTime)}
      </span>

      <span className={`inline-flex items-center gap-2 ${boxClass}`}>
        <Clock className="w-3.5 h-3.5" />
        {formatTime(startTime)} → {formatTime(endTime)}
      </span>
    </div>
  );
}

function ViewBookingModal({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        key="view-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden"
      >
        <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Booking Details
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[booking.status]}`}
              >
                {booking.status}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {booking.userId || 'Unknown user'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-5 space-y-0">
          {[
            ['Facility', booking.facility?.name || '—'],
            ['Location', booking.facility?.location || '—'],
            ['Purpose', booking.purpose || '—'],
            ['Attendees', booking.attendees ?? '—'],
            ['Date', formatDate(booking.startTime)],
            ['Time Slot', `${formatTime(booking.startTime)} → ${formatTime(booking.endTime)}`],
            ['Created', formatDateTime(booking.createdAt)],
            ...(booking.rejectionReason
              ? [['Rejection Reason', booking.rejectionReason]]
              : []),
          ].map(([label, val]) => (
            <div
              key={label}
              className="flex gap-4 py-3 border-b border-slate-50 last:border-0"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 w-32 shrink-0 pt-0.5">
                {label}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {val}
              </span>
            </div>
          ))}
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ManageBookingModal({ booking, onClose, onStatusChange }) {
  const [step, setStep] = useState('view');
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);

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
        <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Manage Booking
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[booking.status]}`}
              >
                {booking.status}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {booking.userId || 'Unknown user'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-5 space-y-0">
          {[
            ['Facility', booking.facility?.name || '—'],
            ['Location', booking.facility?.location || '—'],
            ['Purpose', booking.purpose || '—'],
            ['Attendees', booking.attendees ?? '—'],
            ['Date', formatDate(booking.startTime)],
            ['Time Slot', `${formatTime(booking.startTime)} → ${formatTime(booking.endTime)}`],
            ['Created', formatDateTime(booking.createdAt)],
            ...(booking.rejectionReason
              ? [['Rejection Reason', booking.rejectionReason]]
              : []),
          ].map(([label, val]) => (
            <div
              key={label}
              className="flex gap-4 py-3 border-b border-slate-50 last:border-0"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 w-32 shrink-0 pt-0.5">
                {label}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {val}
              </span>
            </div>
          ))}
        </div>

        <div className="px-8 pb-8 pt-2">
          {step === 'view' && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
                Change Status
              </p>

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

          {step === 'confirm_approve' && (
            <div className="bg-emerald-50 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-bold text-emerald-800">
                Confirm approval of this booking?
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
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Yes, Approve
                </button>
              </div>
            </div>
          )}

          {step === 'confirm_reject' && (
            <div className="bg-red-50 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-bold text-red-800">
                Rejection reason required:
              </p>

              <textarea
                rows={3}
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Facility is unavailable at this time..."
                className="w-full bg-white border border-red-200 focus:border-red-400 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-300 placeholder-slate-400 resize-none transition-all"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('view');
                    setRejectReason('');
                  }}
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
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Yes, Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DeleteBookingModal({ booking, deletingId, onClose, onConfirm }) {
  if (!booking) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        transition={{ duration: 0.18 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Delete booking?
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              This booking will be permanently removed from the system.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-extrabold text-slate-800">
                {booking.purpose || 'Untitled booking'}
              </p>

              <p className="mt-1 text-xs font-bold text-slate-400">
                {booking.userId || 'Unknown user'}
              </p>

              <div className="mt-3">
                <SchedulePills
                  startTime={booking.startTime}
                  endTime={booking.endTime}
                  variant="modal"
                />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={!!deletingId}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={!!deletingId}
            className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Keep Booking
          </button>

          <button
            onClick={() => onConfirm(booking.id)}
            disabled={!!deletingId}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
          >
            {deletingId ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Permanently
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [managing, setManaging] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = (id, newStatus, rejectionReason) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status: newStatus,
              rejectionReason: rejectionReason ?? booking.rejectionReason,
            }
          : booking
      )
    );
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await bookingAPI.delete(id);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      toast.success('Booking deleted');
      setDeleteModal(null);
    } catch {
      toast.error('Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = bookings.filter((booking) => {
    const q = search.toLowerCase();

    const matchSearch =
      !search ||
      booking.id?.toLowerCase().includes(q) ||
      booking.userId?.toLowerCase().includes(q) ||
      booking.facility?.name?.toLowerCase().includes(q) ||
      booking.purpose?.toLowerCase().includes(q);

    const matchStatus = !filterStatus || booking.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const counts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Booking Management
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Review, approve, and manage facility bookings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          {
            label: 'Total',
            value: bookings.length,
            icon: '📋',
            color: 'text-slate-800',
          },
          {
            label: 'Pending',
            value: counts.PENDING || 0,
            icon: '⏳',
            color: 'text-amber-700',
          },
          {
            label: 'Approved',
            value: counts.APPROVED || 0,
            icon: '✅',
            color: 'text-emerald-700',
          },
          {
            label: 'Rejected',
            value: counts.REJECTED || 0,
            icon: '❌',
            color: 'text-red-700',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6"
          >
            <span className="text-2xl mb-3 block">{item.icon}</span>
            <p className={`text-4xl font-extrabold ${item.color} mb-1`}>
              {item.value}
            </p>
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search by purpose, booking ID, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', ...ALL_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        <p className="text-sm font-semibold text-slate-400 shrink-0">
          {filtered.length} of {bookings.length}
        </p>
      </div>

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
                  {[
                    'Requested By',
                    'Facility',
                    'Purpose',
                    'Schedule',
                    'Status',
                    'Actions',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <td className="px-6 py-5 w-[190px]">
                      <div className="flex flex-col max-w-[175px]">
                        <span className="text-sm font-bold text-slate-700 truncate">
                          {booking.userId || 'Unknown user'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 w-[220px]">
                      <div className="flex items-center gap-3">
                        {booking.facility?.imageUrl ? (
                          <img
                            src={booking.facility.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                        )}

                        <div className="flex flex-col max-w-[170px]">
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {booking.facility?.name || 'Unknown Facility'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {booking.facility?.location || 'No location'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 min-w-[220px]">
                      <span className="block text-sm font-semibold text-slate-800 line-clamp-2">
                        {booking.purpose || '—'}
                      </span>
                    </td>

                    <td className="px-6 py-5 min-w-[220px]">
                      <SchedulePills
                        startTime={booking.startTime}
                        endTime={booking.endTime}
                      />
                    </td>

                    <td className="px-6 py-5 w-[120px]">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${
                          STATUS_STYLE[booking.status] || ''
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 w-[165px]">
                      <div className="flex items-center gap-1">
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => setManaging(booking)}
                            className="px-3 py-1.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
                            title="Manage"
                          >
                            Manage
                          </button>
                        )}

                        <button
                          onClick={() => setViewing(booking)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteModal(booking)}
                          disabled={!!deletingId}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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

      <AnimatePresence>
        {viewing && (
          <ViewBookingModal
            key={viewing.id}
            booking={viewing}
            onClose={() => setViewing(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal && (
          <DeleteBookingModal
            key={deleteModal.id}
            booking={deleteModal}
            deletingId={deletingId}
            onClose={() => {
              if (!deletingId) setDeleteModal(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}