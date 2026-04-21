import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CreateBooking from "./pages/CreateBooking";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";

import "./styles/booking-base.css";
import "./styles/dashboard.css";
import "./styles/create-booking.css";
import "./styles/my-bookings.css";
import "./styles/admin-bookings.css";

export default function BookingModule() {
  return (
    <BrowserRouter>
      <div className="booking-shell">
        <Navbar />

        <main className="booking-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings/create" element={<CreateBooking />} />
            <Route path="/bookings/my" element={<MyBookings />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}