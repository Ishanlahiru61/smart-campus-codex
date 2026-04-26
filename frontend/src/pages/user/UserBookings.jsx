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
  RefreshCcw,
  Pencil,
  MapPin,
} from 'lucide-react';
import { userBookingAPI } from '../../services/userApi';
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

const RESOURCE_NAMES = {
  A301: 'A301 Lecture Hall',
  A302: 'A302 Lecture Hall',
  A303: 'A303 Lecture Hall',
  B401: 'B401 Computer Lab',
  B402: 'B402 Computer Lab',
  AUDITORIUM: 'Main Auditorium',
};

const getResourceName = (booking) =>
  booking?.facility?.name ||
  booking?.resourceName ||
  booking?.resource?.name ||
  RESOURCE_NAMES[booking?.resourceId] ||
  'Unknown Facility';

const getResourceLocation = (booking) =>
  booking?.facility?.location ||
  booking?.resource?.location ||
  'No location';

const toDateInput = (dt) => (dt ? new Date(dt).toISOString().slice(0, 10) : '');

const toTimeInput = (dt) => {
  if (!dt) return '';
  const date = new Date(dt);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    booking: null,
    date: '',
    startTime: '',
    endTime: '',
  });

  const [updateModal, setUpdateModal] = useState({
    open: false,
    booking: null,
    resourceId: '',
    resourceName: '',
    resourceLocation: '',
    purpose: '',
    attendees: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await userBookingAPI.getMyBookings();
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

  const openCancelModal = (booking) => {
    setCancelModal({ open: true, booking });
  };

  const closeCancelModal = () => {
    if (cancellingId) return;
    setCancelModal({ open: false, booking: null });
  };

  const openRescheduleModal = (booking) => {
    setRescheduleModal({
      open: true,
      booking,
      date: toDateInput(booking.startTime),
      startTime: toTimeInput(booking.startTime),
      endTime: toTimeInput(booking.endTime),
    });
  };

  const closeRescheduleModal = () => {
    if (reschedulingId) return;
    setRescheduleModal({
      open: false,
      booking: null,
      date: '',
      startTime: '',
      endTime: '',
    });
  };

  const openUpdateModal = (booking) => {
    setUpdateModal({
      open: true,
      booking,
      resourceId: booking.resourceId || '',
      resourceName: getResourceName(booking),
      resourceLocation: getResourceLocation(booking),
      purpose: booking.purpose || '',
      attendees: booking.attendees || '',
      date: toDateInput(booking.startTime),
      startTime: toTimeInput(booking.startTime),
      endTime: toTimeInput(booking.endTime),
    });
  };

  const closeUpdateModal = () => {
    if (updatingId) return;
    setUpdateModal({
      open: false,
      booking: null,
      resourceId: '',
      resourceName: '',
      resourceLocation: '',
      purpose: '',
      attendees: '',
      date: '',
      startTime: '',
      endTime: '',
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

  const confirmReschedule = async () => {
    const bookingId = rescheduleModal.booking?.id;
    if (!bookingId) return;

    if (!rescheduleModal.date || !rescheduleModal.startTime || !rescheduleModal.endTime) {
      toast.error('Please select date, start time, and end time');
      return;
    }

    const startTime = `${rescheduleModal.date}T${rescheduleModal.startTime}:00`;
    const endTime = `${rescheduleModal.date}T${rescheduleModal.endTime}:00`;

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      setReschedulingId(bookingId);

      const updated = await userBookingAPI.reschedule(bookingId, {
        startTime,
        endTime,
      });

      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? updated : booking))
      );

      toast.success('Booking rescheduled');
      closeRescheduleModal();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data?.details ||
          err.message ||
          'Failed to reschedule booking'
      );
    } finally {
      setReschedulingId(null);
    }
  };

  const confirmUpdate = async () => {
    const bookingId = updateModal.booking?.id;
    if (!bookingId) return;

    if (
      !updateModal.resourceId ||
      !updateModal.purpose ||
      !updateModal.attendees ||
      !updateModal.date ||
      !updateModal.startTime ||
      !updateModal.endTime
    ) {
      toast.error('Please fill all update fields');
      return;
    }

    const startTime = `${updateModal.date}T${updateModal.startTime}:00`;
    const endTime = `${updateModal.date}T${updateModal.endTime}:00`;

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      setUpdatingId(bookingId);

      const updated = await userBookingAPI.update(bookingId, {
        resourceId: updateModal.resourceId,
        purpose: updateModal.purpose,
        attendees: Number(updateModal.attendees),
        startTime,
        endTime,
      });

      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? updated : booking))
      );

      toast.success('Booking updated');
      closeUpdateModal();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data?.details ||
          err.message ||
          'Failed to update booking'
      );
    } finally {
      setUpdatingId(null);
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
          <p className="text-xl font-extrabold text-slate-800">No bookings found</p>
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

                <div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {booking.purpose}
                  </h3>

                  <p className="mt-1 text-sm font-extrabold text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {getResourceName(booking)}
                    {getResourceLocation(booking) !== 'No location' && (
                      <span className="text-xs font-bold text-slate-400">
                        • {getResourceLocation(booking)}
                      </span>
                    )}
                  </p>
                </div>

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
                    <XCircle className="w-3.5 h-3.5" /> Reason: {booking.rejectionReason}
                  </p>
                )}
              </div>

              {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  {booking.status === 'PENDING' && (
                    <button
                      onClick={() => openUpdateModal(booking)}
                      disabled={updatingId === booking.id}
                      className="px-6 py-3 text-xs font-black tracking-widest text-blue-700 bg-blue-50 hover:bg-blue-700 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm uppercase"
                    >
                      {updatingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pencil className="w-4 h-4" />
                      )}
                      Update
                    </button>
                  )}

                  <button
                    onClick={() => openCancelModal(booking)}
                    disabled={cancellingId === booking.id}
                    className="px-6 py-3 text-xs font-black tracking-widest text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm uppercase"
                  >
                    {cancellingId === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Cancel
                  </button>

                  <button
                    onClick={() => openRescheduleModal(booking)}
                    disabled={reschedulingId === booking.id}
                    className="px-6 py-3 text-xs font-black tracking-widest text-purple-700 bg-purple-50 hover:bg-purple-700 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm uppercase"
                  >
                    {reschedulingId === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}
                    Reschedule
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {updateModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUpdateModal}
          >
            <motion.div
              className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Pencil className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Update booking
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Update is available only for pending bookings.
                  </p>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                        Facility
                      </label>

                      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-extrabold text-slate-800">
                          {updateModal.resourceName}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {updateModal.resourceLocation}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                        Purpose
                      </label>
                      <textarea
                        rows="2"
                        value={updateModal.purpose}
                        onChange={(event) =>
                          setUpdateModal((prev) => ({
                            ...prev,
                            purpose: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                        Attendees
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={updateModal.attendees}
                        onChange={(event) =>
                          setUpdateModal((prev) => ({
                            ...prev,
                            attendees: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                        Date
                      </label>
                      <input
                        type="date"
                        value={updateModal.date}
                        onChange={(event) =>
                          setUpdateModal((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                          Start Time
                        </label>
                        <input
                          type="time"
                          step="1800"
                          value={updateModal.startTime}
                          onChange={(event) =>
                            setUpdateModal((prev) => ({
                              ...prev,
                              startTime: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                          End Time
                        </label>
                        <input
                          type="time"
                          step="1800"
                          value={updateModal.endTime}
                          onChange={(event) =>
                            setUpdateModal((prev) => ({
                              ...prev,
                              endTime: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeUpdateModal}
                  disabled={!!updatingId}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  onClick={closeUpdateModal}
                  disabled={!!updatingId}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  onClick={confirmUpdate}
                  disabled={!!updatingId}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:opacity-60"
                >
                  {updatingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  Save Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {rescheduleModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeRescheduleModal}
          >
            <motion.div
              className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                  <RefreshCcw className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Reschedule booking
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Select a new date and time range.
                  </p>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                        Facility
                      </label>

                      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-extrabold text-slate-800">
                          {getResourceName(rescheduleModal.booking)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {getResourceLocation(rescheduleModal.booking)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                        New Date
                      </label>
                      <input
                        type="date"
                        value={rescheduleModal.date}
                        onChange={(event) =>
                          setRescheduleModal((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                          Start Time
                        </label>
                        <input
                          type="time"
                          step="1800"
                          value={rescheduleModal.startTime}
                          onChange={(event) =>
                            setRescheduleModal((prev) => ({
                              ...prev,
                              startTime: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                          End Time
                        </label>
                        <input
                          type="time"
                          step="1800"
                          value={rescheduleModal.endTime}
                          onChange={(event) =>
                            setRescheduleModal((prev) => ({
                              ...prev,
                              endTime: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeRescheduleModal}
                  disabled={!!reschedulingId}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  onClick={closeRescheduleModal}
                  disabled={!!reschedulingId}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  onClick={confirmReschedule}
                  disabled={!!reschedulingId}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-purple-700/20 transition hover:bg-purple-800 disabled:opacity-60"
                >
                  {reschedulingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  Send Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                        {cancelModal.booking.purpose || 'Untitled booking'}
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {getResourceName(cancelModal.booking)}
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