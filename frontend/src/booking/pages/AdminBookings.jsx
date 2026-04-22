import { useEffect, useMemo, useState } from "react";
import bookingApi from "../services/bookingApi";
import { getStatusClassName } from "../utils/bookingFormat";

const MOCK_RESOURCES = [
  {
    id: "res001",
    name: "A301",
    type: "Lecture Hall",
    location: "Main Building - 3rd Floor",
    capacity: 120,
  },
  {
    id: "res002",
    name: "A302",
    type: "Lecture Hall",
    location: "Main Building - 3rd Floor",
    capacity: 120,
  },
  {
    id: "res003",
    name: "A303",
    type: "Lecture Hall",
    location: "Main Building - 3rd Floor",
    capacity: 120,
  },
  {
    id: "res004",
    name: "B401",
    type: "Computer Lab",
    location: "Main Building - 4th Floor",
    capacity: 60,
  },
  {
    id: "res005",
    name: "B402",
    type: "Computer Lab",
    location: "Main Building - 4th Floor",
    capacity: 60,
  },
  {
    id: "res006",
    name: "Main Auditorium",
    type: "Auditorium",
    location: "Main Building - Ground Floor",
    capacity: 300,
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

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    bookingId: null,
    bookingPurpose: "",
    reason: "",
    error: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bookingId: null,
    bookingPurpose: "",
    resourceName: "",
    resourceType: "",
    displayDate: "",
    displayStartTime: "",
    displayEndTime: "",
    status: "",
    userId: "",
  });

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

  const openRejectModal = (bookingId, status, purpose) => {
    if (!canApproveOrReject(status)) return;

    setRejectModal({
      isOpen: true,
      bookingId,
      bookingPurpose: purpose || "this booking",
      reason: "",
      error: "",
    });
    setMessage("");
    setError("");
  };

  const closeRejectModal = () => {
    if (actionLoading.type === "reject") return;

    setRejectModal({
      isOpen: false,
      bookingId: null,
      bookingPurpose: "",
      reason: "",
      error: "",
    });
  };

  const openDeleteModal = (booking) => {
    if (!canDelete(booking.status)) return;

    setDeleteModal({
      isOpen: true,
      bookingId: booking.id,
      bookingPurpose: booking.purpose || "this booking",
      resourceName: booking.resourceName || "-",
      resourceType: booking.resourceType || "-",
      displayDate: booking.displayDate || "-",
      displayStartTime: booking.displayStartTime || "-",
      displayEndTime: booking.displayEndTime || "-",
      status: booking.status || "-",
      userId: booking.userId || "-",
    });

    setMessage("");
    setError("");
  };

  const closeDeleteModal = () => {
    if (actionLoading.type === "delete") return;

    setDeleteModal({
      isOpen: false,
      bookingId: null,
      bookingPurpose: "",
      resourceName: "",
      resourceType: "",
      displayDate: "",
      displayStartTime: "",
      displayEndTime: "",
      status: "",
      userId: "",
    });
  };

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

  const submitRejectModal = async () => {
    const trimmedReason = rejectModal.reason.trim();

    if (!trimmedReason) {
      setRejectModal((prev) => ({
        ...prev,
        error: "Rejection reason is required.",
      }));
      return;
    }

    try {
      setActionLoading({ id: rejectModal.bookingId, type: "reject" });
      setMessage("");
      setError("");

      await bookingApi.rejectBooking(rejectModal.bookingId, {
        reason: trimmedReason,
      });

      closeRejectModal();
      setMessage("Booking rejected successfully.");
      await fetchAllBookings();
    } catch (err) {
      setRejectModal((prev) => ({
        ...prev,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to reject booking.",
      }));
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const confirmDeleteModal = async () => {
    if (!deleteModal.bookingId) return;

    try {
      setActionLoading({ id: deleteModal.bookingId, type: "delete" });
      setMessage("");
      setError("");

      await bookingApi.deleteBooking(deleteModal.bookingId);
      closeDeleteModal();
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

  const isRejectingCurrent =
    actionLoading.id === rejectModal.bookingId &&
    actionLoading.type === "reject";

  const isDeletingCurrent =
    actionLoading.id === deleteModal.bookingId &&
    actionLoading.type === "delete";

  return (
    <>
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
                        onClick={() =>
                          openRejectModal(
                            booking.id,
                            booking.status,
                            booking.purpose
                          )
                        }
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
                        onClick={() => openDeleteModal(booking)}
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

      {rejectModal.isOpen && (
        <div
          className="booking-modal-overlay"
          onClick={closeRejectModal}
          role="presentation"
        >
          <div
            className="booking-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-booking-title"
          >
            <div className="booking-modal__header">
              <h3 id="reject-booking-title" className="booking-modal__title">
                Reject Booking
              </h3>
              <button
                type="button"
                className="booking-modal__close"
                onClick={closeRejectModal}
                disabled={isRejectingCurrent}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <p className="booking-modal__subtitle">
              Enter a rejection reason for{" "}
              <strong>{rejectModal.bookingPurpose}</strong>.
            </p>

            <div className="booking-modal__body">
              <label className="booking-label" htmlFor="rejectReason">
                Rejection Reason
              </label>
              <textarea
                id="rejectReason"
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                    error: "",
                  }))
                }
                placeholder="Enter the reason for rejecting this booking"
                className="booking-textarea booking-modal__textarea"
                rows={4}
                autoFocus
              />

              {rejectModal.error && (
                <p className="booking-field-error">{rejectModal.error}</p>
              )}
            </div>

            <div className="booking-modal__actions">
              <button
                type="button"
                onClick={closeRejectModal}
                className="booking-button booking-button--secondary booking-modal__cancel"
                disabled={isRejectingCurrent}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitRejectModal}
                className="booking-button booking-button--danger booking-modal__submit"
                disabled={isRejectingCurrent}
              >
                {isRejectingCurrent ? "Submitting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div
          className="booking-modal-overlay"
          onClick={closeDeleteModal}
          role="presentation"
        >
          <div
            className="booking-modal booking-modal--centered"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-booking-title"
          >
            <div className="booking-modal__header">
              <div>
                <h3 id="delete-booking-title" className="booking-modal__title">
                  Delete Booking
                </h3>
                <p className="booking-modal__subtitle">
                  This will permanently remove the booking from the admin list.
                </p>
              </div>

              <button
                type="button"
                className="booking-modal__close"
                onClick={closeDeleteModal}
                disabled={isDeletingCurrent}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="booking-modal__body">
              <p className="booking-modal__text">
                Are you sure you want to delete{" "}
                <strong>{deleteModal.bookingPurpose}</strong> permanently?
              </p>

              <div className="booking-resource-card booking-resource-card--inline">
                <div className="booking-resource-card__icon">🗑</div>
                <div className="booking-resource-card__content">
                  <span className="booking-resource-card__eyebrow">
                    Booking to Delete
                  </span>
                  <h4 className="booking-resource-card__title">
                    {deleteModal.bookingPurpose}
                  </h4>
                  <p>
                    {deleteModal.resourceName} • {deleteModal.resourceType}
                  </p>
                  <p>User: {deleteModal.userId}</p>
                  <p>
                    {deleteModal.displayDate} • {deleteModal.displayStartTime} -{" "}
                    {deleteModal.displayEndTime}
                  </p>
                  <p>Status: {deleteModal.status}</p>
                </div>
              </div>
            </div>

            <div className="booking-modal__actions">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="booking-button booking-button--secondary booking-modal__cancel"
                disabled={isDeletingCurrent}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteModal}
                className="booking-button booking-button--dark booking-modal__submit"
                disabled={isDeletingCurrent}
              >
                {isDeletingCurrent ? "Deleting..." : "Delete Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}