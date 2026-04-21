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
