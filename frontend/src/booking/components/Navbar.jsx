// import { NavLink } from "react-router-dom";

// const navItems = [
//   { to: "/bookings/admin-dashboard", label: "Admin Dashboard" },
//   { to: "/bookings/admin-bookings", label: "Admin Bookings" },
//   { to: "/bookings/create", label: "Request Booking" },
//   { to: "/bookings/my", label: "My Bookings" },
// ];

// export default function Navbar() {
//   return (
//     <header className="booking-navbar">
//       <div className="booking-navbar__inner">
//         <NavLink to="/bookings" className="booking-navbar__brand">
//           <div className="booking-navbar__logo">SC</div>

//           <div className="booking-navbar__brand-text">
//             <span className="booking-navbar__title">Smart Campus</span>
//             <span className="booking-navbar__subtitle">Booking Portal</span>
//           </div>
//         </NavLink>

//         <nav className="booking-navbar__links">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               className={({ isActive }) =>
//                 isActive
//                   ? "booking-navbar__link booking-navbar__link--active"
//                   : "booking-navbar__link"
//               }
//             >
//               {item.label}
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     </header>
//   );
// }



import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { to: "/bookings/admin-dashboard", label: "Admin Dashboard", roles: ["ADMIN"] },
  { to: "/bookings/admin-bookings", label: "Admin Bookings", roles: ["ADMIN"] },
  { to: "/bookings/create", label: "Request Booking", roles: ["USER"] },
  { to: "/bookings/my", label: "My Bookings", roles: ["USER"] },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("bookingRole") || "ADMIN");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef(null);

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));
  const displayName = role === "ADMIN" ? "Admin" : "User1";

  const changeRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem("bookingRole", newRole);
    setIsRoleMenuOpen(false);

    if (newRole === "ADMIN") {
      navigate("/bookings/admin-dashboard");
    } else {
      navigate("/bookings/create");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {visibleNavItems.map((item) => (
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

        <div className="booking-navbar__profile" ref={roleMenuRef}>
          <button
            type="button"
            className="booking-navbar__avatar"
            onClick={() => setIsRoleMenuOpen((prev) => !prev)}
            aria-label="Switch booking role"
          >
            <svg
              className="booking-navbar__avatar-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 22C20 17.5817 16.4183 14 12 14C7.58172 14 4 17.5817 4 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <span className="booking-navbar__profile-name">{displayName}</span>

          {isRoleMenuOpen && (
            <div className="booking-role-menu">
              <p className="booking-role-menu__title">Switch view</p>

              <button
                type="button"
                className={
                  role === "ADMIN"
                    ? "booking-role-menu__button booking-role-menu__button--active"
                    : "booking-role-menu__button"
                }
                onClick={() => changeRole("ADMIN")}
              >
                Admin
              </button>

              <button
                type="button"
                className={
                  role === "USER"
                    ? "booking-role-menu__button booking-role-menu__button--active"
                    : "booking-role-menu__button"
                }
                onClick={() => changeRole("USER")}
              >
                User1
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}