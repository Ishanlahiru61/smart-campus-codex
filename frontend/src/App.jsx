import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';
import BookingModule from "./booking/BookingModule";

// A simple protective wrapper for the dashboard
const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem('jwtToken');
	if (!token) {
		return <Navigate to="/login" replace />;
	}

	try {
		const decodedToken = jwtDecode(token);
		const currentTime = Date.now() / 1000;
		if (decodedToken.exp < currentTime) {
			localStorage.removeItem('jwtToken');
			return <Navigate to="/login" replace />;
		}
	} catch (error) {
		localStorage.removeItem('jwtToken');
		return <Navigate to="/login" replace />;
	}

	return children;
};

export default function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50 font-inter">
				<Routes>
					{/* Public Routes */}
					<Route path="/" element={<StartPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

					{/* Booking Module Routes */}
					<Route path="/bookings/*" element={<BookingModule />} />
					<Route path="/admin/*" element={<BookingModule />} />

					{/* Protected Routes */}
					<Route path="/dashboard" element={
						<ProtectedRoute>
							<div className="min-h-screen flex flex-col items-center justify-center p-4">
								<div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-slide-up">
									<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
										</svg>
									</div>
									<h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
									<p className="text-gray-500 mb-8">You have successfully authenticated and accessed the secure portal.</p>

									<button
										onClick={() => {
											localStorage.removeItem('jwtToken');
											window.location.href = '/';
										}}
										className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium transition-all duration-200 active:scale-[0.98] shadow-lg shadow-neutral-900/20"
									>
										Sign Out Securely
									</button>
								</div>
							</div>
						</ProtectedRoute>
					} />
				</Routes>
			</div>
		</Router>
	);
}

