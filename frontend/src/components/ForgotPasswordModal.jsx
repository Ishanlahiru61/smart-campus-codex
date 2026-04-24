import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Lock, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data || 'Failed to send OTP. Please check the email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;
    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp-reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! You can now log in.');
      handleClose();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to reset password. Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    onClose();
  };

  if (!open) return null;

  const inpCls = "w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-400" /> Reset Password
          </h2>
          <button onClick={handleClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp} 
                className="space-y-4"
              >
                <p className="text-sm text-neutral-400 mb-4">
                  Enter your registered email address. We'll send you a 6-digit OTP to reset your password.
                </p>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inpCls}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Send OTP <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword} 
                className="space-y-4"
              >
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 text-sm text-blue-400 mb-4">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p>OTP sent to <strong>{email}</strong>. Please check your inbox.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">6-Digit OTP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={inpCls}
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inpCls}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !otp || !newPassword}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
