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
