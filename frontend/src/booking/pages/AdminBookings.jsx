import { useEffect, useMemo, useState } from "react";
import bookingApi from "../services/bookingApi";
import {
  formatDateTime,
  getStatusClassName,
} from "../utils/bookingFormat";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAllBookings = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await bookingApi.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleApprove = async (bookingId) => {
    try {
      setActionLoadingId(bookingId);
      setMessage("");
      setError("");

      await bookingApi.approveBooking(bookingId);
      setMessage("Booking approved successfully.");
      await fetchAllBookings();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve booking."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoadingId(bookingId);
      setMessage("");
      setError("");

      await bookingApi.rejectBooking(bookingId, { reason: reason.trim() });
      setMessage("Booking rejected successfully.");
      await fetchAllBookings();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject booking."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(bookingId);
      setMessage("");
      setError("");

      await bookingApi.deleteBooking(bookingId);
      setMessage("Booking deleted successfully.");
      await fetchAllBookings();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete booking."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="booking-page">
      <div className="booking-container booking-container--wide">
        <div className="booking-page-header booking-page-header--row">
          <div>
            <span className="booking-chip">Administration</span>
            <h1 className="booking-page-title">Admin Bookings</h1>
            <p className="booking-page-subtitle">
              Review all booking requests, filter by status, and manage booking
              decisions.
            </p>
          </div>

          <button
            onClick={fetchAllBookings}
            className="booking-button booking-button--secondary"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="booking-toolbar">
          <div className="booking-toolbar__item">
            <label className="booking-label">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="booking-input"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {message && <div className="booking-alert booking-alert--success">{message}</div>}
        {error && <div className="booking-alert booking-alert--error">{error}</div>}

        <div className="booking-card-grid">
          {filteredBookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-card__header">
                <div>
                  <h3 className="booking-card__title">{booking.purpose}</h3>
                  <p className="booking-card__meta">Booking ID: {booking.id}</p>
                </div>

                <span className={getStatusClassName(booking.status)}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-card__info">
                <div>
                  <span className="booking-card__label">Resource</span>
                  <strong>{booking.resourceId}</strong>
                </div>

                <div>
                  <span className="booking-card__label">User</span>
                  <strong>{booking.userId}</strong>
                </div>

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
                  <span className="booking-card__label">Reason</span>
                  <strong>{booking.rejectionReason || "-"}</strong>
                </div>
              </div>

              <div className="booking-card__actions booking-card__actions--row">
                <button
                  onClick={() => handleApprove(booking.id)}
                  disabled={actionLoadingId === booking.id}
                  className="booking-button booking-button--success"
                >
                  {actionLoadingId === booking.id ? "Working..." : "Approve"}
                </button>

                <button
                  onClick={() => handleReject(booking.id)}
                  disabled={actionLoadingId === booking.id}
                  className="booking-button booking-button--danger"
                >
                  {actionLoadingId === booking.id ? "Working..." : "Reject"}
                </button>

                <button
                  onClick={() => handleDelete(booking.id)}
                  disabled={actionLoadingId === booking.id}
                  className="booking-button booking-button--dark"
                >
                  {actionLoadingId === booking.id ? "Working..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}