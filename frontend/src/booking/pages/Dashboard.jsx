import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8081/api/bookings";

const adminHighlights = [
  {
    label: "Admin Workspace",
    title: "Review Booking Requests",
    description:
      "Open the booking management panel to approve, reject, filter, and remove booking records with a cleaner admin workflow.",
    path: "/bookings/admin-bookings",
    cta: "Open Admin Bookings",
    variant: "primary",
  },
  {
    label: "Approval Flow",
    title: "Manage Pending Decisions",
    description:
      "Handle approval actions, rejection reasons, and final booking cleanup from one focused admin interface.",
    path: "/bookings/admin-bookings",
    cta: "Manage Requests",
    variant: "secondary",
  },
];

const normalizeStatus = (status) => String(status || "").toUpperCase();

const isToday = (value) => {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const formatTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const dashboardStats = useMemo(() => {
    const pending = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "PENDING"
    );

    const approved = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "APPROVED"
    );

    const rejected = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "REJECTED"
    );

    const cancelled = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "CANCELLED"
    );

    const todayBookings = bookings.filter((booking) =>
      isToday(booking.startTime)
    );

    const todayPending = pending.filter((booking) =>
      isToday(booking.startTime)
    );

    return {
      total: bookings.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      cancelled: cancelled.length,
      todayBookings: todayBookings.length,
      todayPending: todayPending.length,
    };
  }, [bookings]);

  const upcomingPending = useMemo(() => {
    return bookings
      .filter((booking) => normalizeStatus(booking.status) === "PENDING")
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 4);
  }, [bookings]);

  return (
    <section className="booking-page booking-page--admin-dashboard">
      <div className="booking-container booking-container--wide">
        <div className="admin-dashboard-hero">
          <div className="admin-dashboard-hero__overlay" />

          <div className="admin-dashboard-hero__content">
            <span className="booking-chip">Admin Workspace</span>

            <h1 className="booking-page-title admin-dashboard-hero__title">
              Booking Administration Dashboard
            </h1>

            <p className="booking-page-subtitle admin-dashboard-hero__subtitle">
              Monitor booking activity, approval queues, and daily campus
              reservations from one focused control panel.
            </p>

            <div className="admin-dashboard-hero__actions">
              <Link
                to="/bookings/admin-bookings"
                className="booking-button booking-button--primary admin-dashboard-hero__button"
              >
                Open Admin Bookings
              </Link>
            </div>

            <div className="admin-dashboard-stats">
              <div className="admin-dashboard-stat">
                <span className="admin-dashboard-stat__value">
                  {loading ? "..." : dashboardStats.pending}
                </span>
                <span className="admin-dashboard-stat__label">
                  Pending Requests
                </span>
              </div>

              <div className="admin-dashboard-stat">
                <span className="admin-dashboard-stat__value">
                  {loading ? "..." : dashboardStats.todayBookings}
                </span>
                <span className="admin-dashboard-stat__label">
                  Bookings Today
                </span>
              </div>

              <div className="admin-dashboard-stat">
                <span className="admin-dashboard-stat__value">
                  {loading ? "..." : dashboardStats.approved}
                </span>
                <span className="admin-dashboard-stat__label">
                  Approved Bookings
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-overview">
          <div className="admin-dashboard-summary-card">
            <span className="admin-dashboard-summary-card__label">
              Today&apos;s Pending
            </span>
            <strong>{loading ? "..." : dashboardStats.todayPending}</strong>
            <p>Requests scheduled for today still waiting for a decision.</p>
          </div>

          <div className="admin-dashboard-summary-card">
            <span className="admin-dashboard-summary-card__label">
              Total Requests
            </span>
            <strong>{loading ? "..." : dashboardStats.total}</strong>
            <p>All booking records currently available in the system.</p>
          </div>

          <div className="admin-dashboard-summary-card">
            <span className="admin-dashboard-summary-card__label">
              Cancelled
            </span>
            <strong>{loading ? "..." : dashboardStats.cancelled}</strong>
            <p>Bookings cancelled after creation or approval workflow.</p>
          </div>

          <div className="admin-dashboard-summary-card">
            <span className="admin-dashboard-summary-card__label">
              Rejected
            </span>
            <strong>{loading ? "..." : dashboardStats.rejected}</strong>
            <p>Requests rejected with admin decision reasons.</p>
          </div>
        </div>

        <div className="admin-dashboard-live-panel">
          <div>
            <span className="booking-chip">Live Queue</span>
            <h2>Pending Requests at a Glance</h2>
            <p>
              Quick view of the next pending bookings that need admin approval.
            </p>
          </div>

          <div className="admin-dashboard-queue">
            {upcomingPending.length === 0 ? (
              <div className="admin-dashboard-queue__empty">
                No pending booking requests right now.
              </div>
            ) : (
              upcomingPending.map((booking) => (
                <div key={booking.id} className="admin-dashboard-queue__item">
                  <div>
                    <strong>{booking.resourceId}</strong>
                    <span>{booking.purpose}</span>
                  </div>

                  <div className="admin-dashboard-queue__time">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-dashboard-grid">
          {adminHighlights.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`admin-dashboard-card admin-dashboard-card--${item.variant}`}
            >
              <span className="admin-dashboard-card__badge">{item.label}</span>

              <h3 className="admin-dashboard-card__title">{item.title}</h3>

              <p className="admin-dashboard-card__text">{item.description}</p>

              <span className="admin-dashboard-card__cta">{item.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}