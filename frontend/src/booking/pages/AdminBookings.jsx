import { useEffect, useMemo, useState } from "react";
import bookingApi from "../services/bookingApi";
import { getStatusClassName } from "../utils/bookingFormat";

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

const toDateInputValue = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDisplayDate = (dateTimeString) => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

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
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const enrichedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const resource = getResourceById(booking.resourceId);

      return {
        ...booking,
        resourceName: resource?.name || booking.resourceId,
        resourceType: resource?.type || "Resource",
        resourceLocation: resource?.location || "-",
        displayDate: formatDisplayDate(booking.startTime),
        displayStartTime: formatDisplayTime(booking.startTime),
        displayEndTime: formatDisplayTime(booking.endTime),
        bookingDateValue: toDateInputValue(booking.startTime),
      };
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return enrichedBookings.filter((booking) => {
      const matchesSearch =
        !normalizedSearch ||
        booking.purpose?.toLowerCase().includes(normalizedSearch) ||
        booking.userId?.toLowerCase().includes(normalizedSearch) ||
        booking.resourceName?.toLowerCase().includes(normalizedSearch) ||
        booking.resourceType?.toLowerCase().includes(normalizedSearch) ||
        booking.resourceLocation?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      const matchesDate =
        !dateFilter || booking.bookingDateValue === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [enrichedBookings, searchTerm, statusFilter, dateFilter]);

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

  const handleDelete = async (bookingId, status, purpose) => {
    if (!canDelete(status)) return;

    const confirmed = window.confirm(
      `Delete "${purpose}" permanently from the bookings list?`
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDateFilter("");
  };

  return (
    <section className="booking-page booking-page--admin-bookings">
      <div className="booking-container booking-container--wide">
        <div className="booking-page-header booking-page-header--row">
          <div>
            <span className="booking-chip">Administration</span>
            <h1 className="booking-page-title">Admin Bookings</h1>
            <p className="booking-page-subtitle">
              Review, filter, approve, reject, and manage all booking requests.
            </p>
          </div>

          <button
            onClick={fetchAllBookings}
            className="booking-button booking-button--secondary"
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="booking-filters-panel">
          <div className="booking-toolbar booking-toolbar--wide">
            <div className="booking-toolbar__item booking-toolbar__item--search">
              <label className="booking-label">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by purpose, user, resource, or type"
                className="booking-input"
              />
            </div>

            <div className="booking-toolbar__item">
              <label className="booking-label">Status</label>
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

            <div className="booking-toolbar__item">
              <label className="booking-label">Booking Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="booking-input"
              />
            </div>

            <div className="booking-toolbar__item booking-toolbar__item--action">
              <label className="booking-label booking-label--hidden">
                Actions
              </label>
              <button
                type="button"
                onClick={clearFilters}
                className="booking-button booking-button--secondary booking-filters-panel__clear"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="booking-alert booking-alert--success">{message}</div>
        )}
        {error && (
          <div className="booking-alert booking-alert--error">{error}</div>
        )}

        {!loading && filteredBookings.length === 0 ? (
          <div className="booking-empty-state">
            <h3>No matching bookings</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="booking-card-grid booking-card-grid--fixed">
            {filteredBookings.map((booking) => {
              const approveRejectAllowed = canApproveOrReject(booking.status);
              const deleteAllowed = canDelete(booking.status);

              const isApproving =
                actionLoading.id === booking.id &&
                actionLoading.type === "approve";

              const isRejecting =
                actionLoading.id === booking.id &&
                actionLoading.type === "reject";

              const isDeleting =
                actionLoading.id === booking.id &&
                actionLoading.type === "delete";

              return (
                <article
                  className="booking-card booking-card--admin-enhanced"
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
                      <span className="booking-card__label">Date</span>
                      <strong>{booking.displayDate}</strong>
                    </div>

                    <div>
                      <span className="booking-card__label">Status</span>
                      <strong>{booking.status}</strong>
                    </div>

                    <div>
                      <span className="booking-card__label">Start Time</span>
                      <strong>{booking.displayStartTime}</strong>
                    </div>

                    <div>
                      <span className="booking-card__label">End Time</span>
                      <strong>{booking.displayEndTime}</strong>
                    </div>

                    {booking.status === "REJECTED" && (
                      <div className="booking-card__full">
                        <span className="booking-card__label">
                          Rejection Reason
                        </span>
                        <strong>{booking.rejectionReason || "-"}</strong>
                      </div>
                    )}
                  </div>

                  <div className="booking-card__actions booking-card__actions--row-refined">
                    <button
                      type="button"
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
                      type="button"
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
                      type="button"
                      onClick={() =>
                        handleDelete(
                          booking.id,
                          booking.status,
                          booking.purpose
                        )
                      }
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
        )}
      </div>
    </section>
  );
}