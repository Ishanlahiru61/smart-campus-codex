import { Link } from "react-router-dom";

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

export default function Dashboard() {
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
              Monitor booking activity, manage approval decisions, and maintain
              a clean reservation workflow for campus resources from one focused
              control panel.
            </p>

            <div className="admin-dashboard-hero__actions">
              <Link
                to="/bookings/admin-bookings"
                className="booking-button booking-button--primary admin-dashboard-hero__button"
              >
                Open Admin Bookings
              </Link>
            </div>
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

              <span className="admin-dashboard-card__cta">
                {item.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}