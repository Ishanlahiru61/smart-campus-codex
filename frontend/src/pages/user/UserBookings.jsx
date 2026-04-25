import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Loader2,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { userBookingAPI } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const STATUS_STYLE = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const STATUS_ICONS = {
  PENDING: <Clock className="w-3.5 h-3.5" />,
  APPROVED: <CheckCircle className="w-3.5 h-3.5" />,
  REJECTED: <XCircle className="w-3.5 h-3.5" />,
  CANCELLED: <X className="w-3.5 h-3.5" />,
};

export default function UserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelModal, setCancelModal] = useState({
    open: false,
    booking: null,
  });

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await userBookingAPI.getMyBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking) => {
    setCancelModal({
      open: true,
      booking,
    });
  };

  const closeCancelModal = () => {
    if (cancellingId) return;

    setCancelModal({
      open: false,
      booking: null,
    });
  };

  const confirmCancel = async () => {
    const bookingId = cancelModal.booking?.id;
    if (!bookingId) return;

    try {
      setCancellingId(bookingId);
      const updated = await userBookingAPI.cancel(bookingId);

      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? updated : booking))
      );

      toast.success('Booking cancelled');
      setCancelModal({ open: false, booking: null });
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
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

  const filtered = !filterStatus
    ? bookings
    : bookings.filter((booking) => booking.status === filterStatus);

  const counts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" /> My Bookings
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Track and manage your facility booking requests
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { label: 'Total', value: bookings.length, icon: '📋', color: 'text-slate-800' },
          { label: 'Pending', value: counts.PENDING || 0, icon: '⏳', color: 'text-amber-700' },
          { label: 'Approved', value: counts.APPROVED || 0, icon: '✅', color: 'text-emerald-700' },
          { label: 'Rejected', value: counts.REJECTED || 0, icon: '❌', color: 'text-red-700' },
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

      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-500 hover:text-slate-800 shadow-[0_4px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)]'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] text-slate-400 border border-dashed border-slate-200">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="text-xl font-extrabold text-slate-800">
            No bookings found
          </p>
          <p className="text-sm font-medium opacity-60 mt-2">
            Browse facilities to make your first booking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 rounded-[24px] px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 border-0 group"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${STATUS_STYLE[booking.status]}`}
                  >
                    {STATUS_ICONS[booking.status]} {booking.status}
                  </span>

                  <span className="text-xs font-black tracking-widest text-slate-300 uppercase">
                    {booking.attendees} attendees
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {booking.purpose}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(booking.startTime)}
                  </span>

                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
                  </span>
                </div>

                {booking.rejectionReason && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-red-100">
                    <XCircle className="w-3.5 h-3.5" /> Reason:{' '}
                    {booking.rejectionReason}
                  </p>
                )}
              </div>

              {booking.status === 'PENDING' && (
                <button
                  onClick={() => openCancelModal(booking)}
                  disabled={cancellingId === booking.id}
                  className="shrink-0 px-6 py-3 text-xs font-black tracking-widest text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-sm uppercase"
                >
                  {cancellingId === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Cancel Booking
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {cancelModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCancelModal}
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
                    Cancel booking?
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Are you sure you want to cancel this booking request?
                  </p>

                  {cancelModal.booking && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-extrabold text-slate-800">
                        {cancelModal.booking.purpose}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(cancelModal.booking.startTime)}
                        </span>

                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(cancelModal.booking.startTime)} →{' '}
                          {formatTime(cancelModal.booking.endTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={closeCancelModal}
                  disabled={!!cancellingId}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  onClick={closeCancelModal}
                  disabled={!!cancellingId}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Keep Booking
                </button>

                <button
                  onClick={confirmCancel}
                  disabled={!!cancellingId}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                >
                  {cancellingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}