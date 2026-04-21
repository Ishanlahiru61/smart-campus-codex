import { Link } from "react-router-dom";

const quickLinks = [
  {
    title: "Create Booking",
    description:
      "Submit a new request for rooms, labs, and other campus resources.",
    path: "/bookings/create",
    variant: "primary",
  },
  {
    title: "My Bookings",
    description:
      "Check your existing reservations and manage cancellations easily.",
    path: "/bookings/my",
    variant: "secondary",
  },
  {
    title: "Admin Bookings",
    description:
      "Review all booking requests, apply filters, and manage approvals.",
    path: "/admin/bookings",
    variant: "neutral",
  },
];

export default function Dashboard() {
  return (
    <section className="booking-page">
      <div className="booking-container">
        <div className="booking-hero">
          <div className="booking-hero__content">
            <span className="booking-chip">Campus Operations</span>
            <h1 className="booking-page-title">
              Smart Campus Booking Dashboard
            </h1>
            <p className="booking-page-subtitle">
              A clean workspace to create reservations, track personal bookings,
              and manage admin approval workflows.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`dashboard-card dashboard-card--${item.variant}`}
            >
              <div className="dashboard-card__badge">{item.title}</div>
              <h3 className="dashboard-card__title">{item.title}</h3>
              <p className="dashboard-card__text">{item.description}</p>
              <span className="dashboard-card__cta">Open section →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}