# Smart Campus Auth Frontend - Rebuild Guide

This guide provides a step-by-step instructional path to completely rebuild the React authentication frontend for the Smart Campus application. It breaks down the existing codebase into logical, manageable components that you can implement and commit sequentially.

---

## Step 1: Project Setup & Main Entry

### `src/index.js`
This file is the main entry point for the React application. It uses React 18's `createRoot` and imports our global styles and the root `App` component.

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<App />);
}
```

**Brief Explanation:**
Initializes React within the `#root` DOM node.

✅ **Commit Point**
**Commit Message:** `chore: setup project entry point and global styles`

---

## Step 2: Axios & API Service Configuration

### `src/api/apiClient.js`
This file sets up a reusable Axios instance targeting the backend base URL. It uses an interceptor to insert the JWT token dynamically into the `Authorization` header, and handles `401 Unauthorized` responses globally by removing stale tokens and redirecting.

```javascript
import axios from 'axios';

// Create an Axios instance configured for the Smart Campus API
const apiClient = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to automatically attach the JWT token 
// to every request via the Authorization header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global authentication errors (like expired tokens)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the API returns a 401 (Unauthorized) status, 
        // the token is likely invalid or expired.
        if (error.response && error.response.status === 401) {
            // Clear the invalid token from storage
            localStorage.removeItem('jwtToken');
            // Redirect the user back to the login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
```

**Brief Explanation:**
Robust API client handling automatic JWT attachment and unauthorized redirects.

✅ **Commit Point**
**Commit Message:** `feat: configure axios API client with jwt request interceptors and token expiry handling`

---

## Step 3: Application Routing & Protected Routes

### `src/App.jsx`
This file handles standard and protected application routes. The `ProtectedRoute` wrapper decodes the JWT (using `jwt-decode`) ensuring standard expiry validation before allowing users to view the secure dashboard. It also provides the session logout mechanic.

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';

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
```

**Brief Explanation:**
Wraps secure elements in `ProtectedRoute` and provides generic routing handling routing alongside our secure session invalidator.

✅ **Commit Point**
**Commit Message:** `feat: implement app routing, protected routes, and session validation bounds`

---

## Step 4: OAuth2 Redirect Handling

### `src/pages/OAuth2RedirectHandler.jsx`
A page dedicated to capturing tokens during external OAuth flows (e.g. Google Login). It intercepts the query parameters returned by the backend, stores the JWT safely, and forces migration to the dashboard. 

```jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // The token comes in the URL format: ?token=eyJhbGci...
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            // Found a token, save it
            localStorage.setItem('jwtToken', token);
            // Redirect the user to the dashboard or home page
            navigate('/dashboard', { replace: true });
        } else {
            // If there's no token, redirect to login page with an error
            navigate('/login?error=oauth2-login-failed', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-xl">Logging you in securely...</h2>
        </div>
    );
}
```

**Brief Explanation:**
Seamlessly intercepts Google authentication redirects and captures valid backend JWTs directly out of search parameters.

✅ **Commit Point**
**Commit Message:** `feat: add oauth2 redirect handler for capturing external authentication tokens`

---

## Step 5: Forgot Password Modal (OTP Flow)

### `src/components/ForgotPasswordModal.jsx`
A 2-step modal handling the forgot password and reset flows. It handles sending the OTP via backend hooks and confirming the correct numeric value to bind the new valid password cleanly. Contains full local validation UI.

```jsx
import React, { useState } from 'react';
import { Mail, Lock, KeyRound, Loader2, Info, X, ArrowRight } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, showToast }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1 fields
    const [email, setEmail] = useState('');

    // Step 2 fields
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const resetState = () => {
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('http://localhost:8081/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                showToast("OTP sent to your email.", "success");
                setStep(2);
            } else if (response.status === 403) {
                showToast("Account is disabled.", "error");
            } else {
                showToast("Email not found or an error occurred.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to connect to server.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!otp || otp.length !== 6) newErrors.otp = "Enter a valid 6-digit OTP";
        if (!newPassword || newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
        if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('http://localhost:8081/auth/verify-otp-reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            if (response.ok) {
                showToast("Password changed successfully", "success");
                handleClose();
            } else {
                const text = await response.text();
                showToast(text || "Failed to reset password. Check your OTP.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to connect to server.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-slide-up z-10 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-1.5 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                        <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h3>
                    <p className="text-neutral-400 text-sm">
                        {step === 1
                            ? "Enter your email and we'll send you a 6-digit OTP to reset your password."
                            : "Enter the OTP sent to your email and your new secure password."}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-neutral-300">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    className={`block w-full pl-11 pr-3 py-3 bg-neutral-800/50 border ${errors.email ? 'border-red-500/50' : 'border-neutral-700/50 focus:border-indigo-500'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
                                    placeholder="your.name@smartcampus.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400 flex items-center"><Info className="w-4 h-4 mr-1" /> {errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-indigo-500 disabled:opacity-70 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Sending...</>
                            ) : (
                                <><Mail className="mr-2 h-4 w-4" /> Send OTP</>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-neutral-300">
                                6-Digit OTP
                            </label>
                            <input
                                type="text"
                                maxLength="6"
                                className={`block w-full px-4 py-3 bg-neutral-800/50 border ${errors.otp ? 'border-red-500/50' : 'border-neutral-700/50 focus:border-indigo-500'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-center tracking-widest font-mono text-lg transition-all`}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                disabled={isLoading}
                            />
                            {errors.otp && (
                                <p className="mt-1 text-sm text-red-400 flex items-center"><Info className="w-4 h-4 mr-1" /> {errors.otp}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-neutral-300">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    className={`block w-full pl-11 pr-3 py-3 bg-neutral-800/50 border ${errors.newPassword ? 'border-red-500/50' : 'border-neutral-700/50 focus:border-indigo-500'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-400 flex items-center"><Info className="w-4 h-4 mr-1" /> {errors.newPassword}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-neutral-300">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    className={`block w-full pl-11 pr-3 py-3 bg-neutral-800/50 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-neutral-700/50 focus:border-indigo-500'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-400 flex items-center"><Info className="w-4 h-4 mr-1" /> {errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900  disabled:opacity-70 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-neutral-900" /> Resetting...</>
                            ) : (
                                <>Reset Password <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
```

**Brief Explanation:**
Isolates all OTP state and server-side request bindings within a single context, ensuring modal rendering remains completely disconnected from primary site logic.

✅ **Commit Point**
**Commit Message:** `feat: implement 2-step forgot password and reset modal functionality`

---

## Step 6: Core Login Page UI & Unified Auth Handling

### `src/pages/LoginPage.jsx`
The primary authentication face of the application serving standard log-ins and passing execution context via `window.location`. Contains dynamic elements tying into the previous `ForgotPasswordModal` and redirect parameters for failed OAuth hooks.

```jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Info, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    const isError = type === 'error';
    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center p-4 mb-4 text-sm rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-md bg-opacity-90 ${isError ? 'text-red-800 bg-red-100 border border-red-200' : 'text-emerald-800 bg-emerald-100 border border-emerald-200'}`}>
            {isError ? <XCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
            <span className="font-medium mr-4">{message}</span>
            <button onClick={onClose} className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-black/5 focus:ring-2 focus:ring-gray-300 transition-colors ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
                <span className="sr-only">Close</span>
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ message: '', type: '' });
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const errorMsg = searchParams.get('error');
        if (errorMsg) {
            setToast({ message: errorMsg, type: 'error' });
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: '' }), 5000);
    };

    const handleStandardLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('http://localhost:8081/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);
                showToast('Welcome back! Redirecting you securely...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1200);
            } else {
                let errorMessage = 'We encountered an unexpected error. Please hold on.';
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseError) {
                    console.error('Could not parse error response');
                }
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Unable to reach the Smart Campus API. Please check your connection.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex font-inter overflow-hidden relative selection:bg-indigo-500/30">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

            {/* Left Aesthetic Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 opacity-90 z-0"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide">Smart Campus</span>
                </div>

                <div className="relative z-10 mb-20 animate-fade-in">
                    <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                        Unlock your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
                            academic potential.
                        </span>
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-md font-light leading-relaxed">
                        Access secure facilities, unified operations, and personalized academic portals through the Smart Campus Operations Hub.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-4 text-indigo-200 text-sm">
                    <p>&copy; 2026 Smart Campus Institute</p>
                </div>
            </div>

            {/* Right Login Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10">
                <div className="w-full max-w-md space-y-8 animate-slide-up">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
                        <p className="text-neutral-400 mt-2">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleStandardLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Mail className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className={`block w-full pl-11 pr-3 py-3 bg-neutral-800/50 border ${errors.email ? 'border-red-500/50' : 'border-neutral-700/50'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 sm:text-sm transition-all duration-300 backdrop-blur-sm`}
                                    placeholder="your.name@smartcampus.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-400 flex items-center">
                                    <Info className="w-4 h-4 mr-1 pb-0.5" /> {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={`block w-full pl-11 pr-11 py-3 bg-neutral-800/50 border ${errors.password ? 'border-red-500/50' : 'border-neutral-700/50'} rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-4 sm:text-sm transition-all duration-300 backdrop-blur-sm`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-400 flex items-center">
                                    <Info className="w-4 h-4 mr-1 pb-0.5" /> {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setIsForgotModalOpen(true); }}
                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full flex justify-center items-center py-3 px-4 mt-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] text-sm font-semibold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-neutral-900" /> Authenticating...</>
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-800" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-neutral-900 text-neutral-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <a
                                href="http://localhost:8081/oauth2/authorization/google"
                                className={`w-full flex justify-center items-center px-4 py-3 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 rounded-xl shadow-sm text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 active:scale-[0.98] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                Authenticate with Google
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
                showToast={showToast}
            />
        </div>
    );
}
```

**Brief Explanation:**
Full integration of standard API log-ins, seamless injection of Google external OAuth calls, and ties directly to the visual forgot password module overlay.

✅ **Commit Point**
**Commit Message:** `feat: create responsive login page handling custom JWT auth and Google OAuth2 hooks`

---

## Conclusion
Following these steps ensures that every component is self-contained. The approach emphasizes clean dependencies: configuring our Axios interceptors immediately, securing standard application routing, managing pure states and UI separated nicely across files, and gracefully tying both OAuth & classic mechanisms to the primary visual login interface.
