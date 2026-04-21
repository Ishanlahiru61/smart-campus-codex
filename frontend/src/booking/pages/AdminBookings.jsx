import { useEffect, useMemo, useState } from "react";
import bookingApi from "../services/bookingApi";
import {
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

const canApproveOrReject = (status) => status === "PENDING";
const canDelete = (status) => status === "CANCELLED" || status === "REJECTED";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: "",
  });
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
    const enriched = bookings.map((booking) => {
      const resource = getResourceById(booking.resourceId);

      return {
        ...booking,
        resourceName: resource?.name || booking.resourceId,
        resourceType: resource?.type || "Resource",
        resourceLocation: resource?.location || "-",
      };
    });

    if (statusFilter === "ALL") return enriched;
    return enriched.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleApprove = async (bookingId, status) => {
    if (!canApproveOrReject(status)) return;

    try {
      setActionLoading({ id: bookingId, type: "approve" });
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
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleReject = async (bookingId, status) => {
    if (!canApproveOrReject(status)) return;

    const reason = window.prompt("Enter rejection reason:");
    if (!reason?.trim()) return;

    try {
      setActionLoading({ id: bookingId, type: "reject" });
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
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleDelete = async (bookingId, status) => {
    if (!canDelete(status)) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    try {
      setActionLoading({ id: bookingId, type: "delete" });
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
      setActionLoading({ id: null, type: "" });
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
            ↻ {loading ? "Refreshing..." : "Refresh"}
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

        {message && (
          <div className="booking-alert booking-alert--success">{message}</div>
        )}
        {error && (
          <div className="booking-alert booking-alert--error">{error}</div>
        )}

        <div className="booking-card-grid">
          {filteredBookings.map((booking) => {
            const approveRejectAllowed = canApproveOrReject(booking.status);
            const deleteAllowed = canDelete(booking.status);

            const isApproving =
              actionLoading.id === booking.id && actionLoading.type === "approve";
            const isRejecting =
              actionLoading.id === booking.id && actionLoading.type === "reject";
            const isDeleting =
              actionLoading.id === booking.id && actionLoading.type === "delete";

            return (
              <article
                className="booking-card booking-card--admin"
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
                    <span className="booking-card__label">User</span>
                    <strong>{booking.userId}</strong>
                  </div>

                  <div>
                    <span className="booking-card__label">Attendees</span>
                    <strong>{booking.attendees}</strong>
                  </div>

                  <div>
                    <span className="booking-card__label">Start</span>
                    <strong>{formatDateTime(booking.startTime)}</strong>
                  </div>

                  <div>
                    <span className="booking-card__label">End</span>
                    <strong>{formatDateTime(booking.endTime)}</strong>
                  </div>

                  <div className="booking-card__full">
                    <span className="booking-card__label">Reason</span>
                    <strong>{booking.rejectionReason || "-"}</strong>
                  </div>
                </div>

                <div className="booking-card__actions booking-card__actions--row">
                  <button
                    onClick={() => handleApprove(booking.id, booking.status)}
                    disabled={!approveRejectAllowed || isApproving}
                    className="booking-button booking-button--success"
                    title={
                      approveRejectAllowed
                        ? "Approve booking"
                        : "Approve is only allowed for PENDING bookings"
                    }
                  >
                    {isApproving ? "Working..." : "✓ Approve"}
                  </button>

                  <button
                    onClick={() => handleReject(booking.id, booking.status)}
                    disabled={!approveRejectAllowed || isRejecting}
                    className="booking-button booking-button--danger"
                    title={
                      approveRejectAllowed
                        ? "Reject booking"
                        : "Reject is only allowed for PENDING bookings"
                    }
                  >
                    {isRejecting ? "Working..." : "⚠ Reject"}
                  </button>

                  <button
                    onClick={() => handleDelete(booking.id, booking.status)}
                    disabled={!deleteAllowed || isDeleting}
                    className="booking-button booking-button--dark"
                    title={
                      deleteAllowed
                        ? "Delete booking"
                        : "Delete is only allowed for REJECTED or CANCELLED bookings"
                    }
                  >
                    {isDeleting ? "Working..." : "🗑 Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}