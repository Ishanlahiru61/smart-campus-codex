import { useEffect, useMemo, useState } from "react";
import bookingApi from "../services/bookingApi";
import {
  combineDateAndTime,
  DEMO_USER_ID,
  formatDateTime,
  getStatusClassName,
} from "../utils/bookingFormat";

const MOCK_RESOURCES = [
  {
    id: "res001",
    name: "Lecture Hall A",
    type: "Lecture Hall",
    location: "Block A",
    capacity: 120,
  },
  {
    id: "res002",
    name: "Computer Lab 1",
    type: "Computer Lab",
    location: "Block B - Floor 2",
    capacity: 40,
  },
  {
    id: "res003",
    name: "Main Auditorium",
    type: "Auditorium",
    location: "Main Building",
    capacity: 300,
  },
  {
    id: "res004",
    name: "Biology Lab",
    type: "Laboratory",
    location: "Science Wing",
    capacity: 35,
  },
  {
    id: "res005",
    name: "Meeting Room 2",
    type: "Meeting Room",
    location: "Admin Block",
    capacity: 12,
  },
];

const getResourceById = (resourceId) =>
  MOCK_RESOURCES.find((resource) => resource.id === resourceId);

const canModifyBooking = (status) =>
  status === "PENDING" || status === "APPROVED";

const canDeleteBooking = (status) =>
  status === "CANCELLED" || status === "REJECTED";

const toDateInputValue = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toTimeInputValue = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    bookingDate: "",
    startTimeOnly: "",
    endTimeOnly: "",
  });

  const fetchBookings = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await bookingApi.getBookingsByUserId(DEMO_USER_ID);
      const bookingArray = Array.isArray(data) ? data : [];
      setBookings(bookingArray);

      if (bookingArray.length === 0) {
        setMessage("No bookings found.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch bookings."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const enrichedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const resource = getResourceById(booking.resourceId);

      return {
        ...booking,
        resourceName: resource?.name || booking.resourceId,
        resourceType: resource?.type || "Resource",
        resourceLocation: resource?.location || "-",
      };
    });
  }, [bookings]);

  const handleCancel = async (booking) => {
    if (!canModifyBooking(booking.status)) return;

    try {
      setActionLoading({ id: booking.id, type: "cancel" });
      setMessage("");
      setError("");

      await bookingApi.cancelBooking(booking.id);
      setMessage("Booking cancelled successfully.");
      await fetchBookings();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel booking."
      );
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleDelete = async (booking) => {
    if (!canDeleteBooking(booking.status)) return;

    const confirmed = window.confirm(
      `Delete "${booking.purpose}" permanently from your bookings list?`
    );

    if (!confirmed) return;

    try {
      setActionLoading({ id: booking.id, type: "delete" });
      setMessage("");
      setError("");

      await bookingApi.deleteBooking(booking.id);
      setMessage("Booking deleted successfully.");
      await fetchBookings();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete booking."
      );
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const openRescheduleModal = (booking) => {
    if (!canModifyBooking(booking.status)) return;

    setSelectedBooking(booking);
    setRescheduleForm({
      bookingDate: toDateInputValue(booking.startTime),
      startTimeOnly: toTimeInputValue(booking.startTime),
      endTimeOnly: toTimeInputValue(booking.endTime),
    });
    setIsRescheduleOpen(true);
    setMessage("");
    setError("");
  };

  const closeRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedBooking(null);
    setRescheduleForm({
      bookingDate: "",
      startTimeOnly: "",
      endTimeOnly: "",
    });
  };

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target;
    setRescheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBooking) return;

    try {
      setActionLoading({ id: selectedBooking.id, type: "reschedule" });
      setMessage("");
      setError("");

      const startTime = combineDateAndTime(
        rescheduleForm.bookingDate,
        rescheduleForm.startTimeOnly
      );
      const endTime = combineDateAndTime(
        rescheduleForm.bookingDate,
        rescheduleForm.endTimeOnly
      );

      if (!startTime || !endTime) {
        throw new Error("Please select booking date, start time, and end time.");
      }

      if (startTime >= endTime) {
        throw new Error("End time must be after start time.");
      }

      await bookingApi.rescheduleBooking(selectedBooking.id, {
        startTime,
        endTime,
      });

      setMessage(
        "Booking rescheduled successfully. Approved bookings return to PENDING for review."
      );
      closeRescheduleModal();
      await fetchBookings();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reschedule booking."
      );
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  return (
    <section className="booking-page">
      <div className="booking-container booking-container--wide">
        <div className="booking-page-header booking-page-header--row">
          <div>
            <span className="booking-chip">Personal View</span>
            <h1 className="booking-page-title">My Bookings</h1>
            <p className="booking-page-subtitle">
              View your reservations, reschedule when needed, and manage
              cancellations cleanly.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="booking-button booking-button--secondary"
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {message && (
          <div className="booking-alert booking-alert--success">{message}</div>
        )}
        {error && (
          <div className="booking-alert booking-alert--error">{error}</div>
        )}

        {!loading && enrichedBookings.length === 0 ? (
          <div className="booking-empty-state">
            <h3>No bookings yet</h3>
            <p>Your bookings will appear here once you create one.</p>
          </div>
        ) : (
          <div className="booking-card-grid booking-card-grid--fixed">
            {enrichedBookings.map((booking) => {
              const allowModify = canModifyBooking(booking.status);
              const allowDelete = canDeleteBooking(booking.status);

              const isCancelling =
                actionLoading.id === booking.id &&
                actionLoading.type === "cancel";

              const isDeleting =
                actionLoading.id === booking.id &&
                actionLoading.type === "delete";

              const isRescheduling =
                actionLoading.id === booking.id &&
                actionLoading.type === "reschedule";

              return (
                <article
                  className="booking-card booking-card--enhanced"
                  key={booking.id}
                >
                  <div className="booking-card__header">
                    <div>
                      <h3 className="booking-card__title">{booking.purpose}</h3>
                      <p className="booking-card__submeta">
                        {booking.resourceType} • {booking.resourceLocation}
                      </p>
                    </div>

                    <span className={getStatusClassName(booking.status)}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-card__resource-banner">
                    <span className="booking-card__resource-icon">🏫</span>
                    <div>
                      <span className="booking-card__resource-label">
                        Resource
                      </span>
                      <strong className="booking-card__resource-name">
                        {booking.resourceName}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-card__info">
                    <div>
                      <span className="booking-card__label">Start</span>
                      <strong>{formatDateTime(booking.startTime)}</strong>
                    </div>

                    <div>
                      <span className="booking-card__label">End</span>
                      <strong>{formatDateTime(booking.endTime)}</strong>
                    </div>

                    <div>
                      <span className="booking-card__label">Attendees</span>
                      <strong>{booking.attendees}</strong>
                    </div>

                    <div>
                      <span className="booking-card__label">Current Status</span>
                      <strong>{booking.status}</strong>
                    </div>

                    <div className="booking-card__full">
                      <span className="booking-card__label">
                        Rejection Reason
                      </span>
                      <strong>{booking.rejectionReason || "-"}</strong>
                    </div>
                  </div>

                  <div className="booking-card__actions booking-card__actions--inline">
                    <button
                      type="button"
                      onClick={() => openRescheduleModal(booking)}
                      disabled={!allowModify || isRescheduling}
                      className="booking-button booking-button--ghost-primary"
                      title={
                        allowModify
                          ? "Reschedule booking"
                          : "Only PENDING and APPROVED bookings can be rescheduled"
                      }
                    >
                      {isRescheduling ? "Saving..." : "🗓 Reschedule"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCancel(booking)}
                      disabled={!allowModify || isCancelling}
                      className="booking-button booking-button--soft"
                      title={
                        allowModify
                          ? "Cancel booking"
                          : "Only PENDING and APPROVED bookings can be cancelled"
                      }
                    >
                      {isCancelling ? "Cancelling..." : "✕ Cancel"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(booking)}
                      disabled={!allowDelete || isDeleting}
                      className="booking-button booking-button--ghost"
                      title={
                        allowDelete
                          ? "Delete booking"
                          : "Only CANCELLED and REJECTED bookings can be deleted"
                      }
                    >
                      {isDeleting ? "Deleting..." : "🗑 Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isRescheduleOpen && selectedBooking && (
        <div className="booking-modal-overlay" onClick={closeRescheduleModal}>
          <div
            className="booking-modal booking-modal--centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-modal__header">
              <div>
                <h3>Reschedule Booking</h3>
                <p>{selectedBooking.purpose}</p>
              </div>

              <button
                type="button"
                className="booking-modal__close"
                onClick={closeRescheduleModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="booking-form">
              <div className="booking-form-grid booking-form-grid--modal">
                <div className="booking-field">
                  <label className="booking-label">Booking Date</label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={rescheduleForm.bookingDate}
                    onChange={handleRescheduleChange}
                    required
                    className="booking-input"
                  />
                </div>

                <div className="booking-field">
                  <label className="booking-label">Start Time</label>
                  <input
                    type="time"
                    name="startTimeOnly"
                    value={rescheduleForm.startTimeOnly}
                    onChange={handleRescheduleChange}
                    required
                    className="booking-input"
                  />
                </div>

                <div className="booking-field booking-field--full">
                  <label className="booking-label">End Time</label>
                  <input
                    type="time"
                    name="endTimeOnly"
                    value={rescheduleForm.endTimeOnly}
                    onChange={handleRescheduleChange}
                    required
                    className="booking-input"
                  />
                </div>
              </div>

              <div className="booking-modal__note">
                Approved bookings that are rescheduled should return to
                <strong> PENDING</strong>.
              </div>

              <div className="booking-modal__actions">
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="booking-button booking-button--secondary"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="booking-button booking-button--primary"
                  disabled={actionLoading.type === "reschedule"}
                >
                  {actionLoading.type === "reschedule"
                    ? "Saving..."
                    : "Save Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}