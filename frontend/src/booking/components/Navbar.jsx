import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/bookings/admin-dashboard", label: "Admin Dashboard" },
  { to: "/bookings/admin-bookings", label: "Admin Bookings" },
  { to: "/bookings/create", label: "Request Booking" },
  { to: "/bookings/my", label: "My Bookings" },
];

export default function Navbar() {
  return (
    <header className="booking-navbar">
      <div className="booking-navbar__inner">
        <NavLink to="/bookings" className="booking-navbar__brand">
          <div className="booking-navbar__logo">SC</div>

          <div className="booking-navbar__brand-text">
            <span className="booking-navbar__title">Smart Campus</span>
            <span className="booking-navbar__subtitle">Booking Portal</span>
          </div>
        </NavLink>

        <nav className="booking-navbar__links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "booking-navbar__link booking-navbar__link--active"
                  : "booking-navbar__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}