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

  const inpCls = "w-full pl-11 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] w-full max-w-md overflow-hidden relative"
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <KeyRound className="w-6 h-6 text-blue-600" /> Reset Password
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSendOtp} 
                className="space-y-6"
              >
                <p className="text-sm font-medium text-slate-500 leading-relaxed bg-blue-50/50 p-4 rounded-2xl">
                  Enter your registered email address. We'll send you a <span className="text-blue-600 font-bold">6-digit OTP</span> to reset your password.
                </p>
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                      <Mail className="h-5 w-5 text-slate-300" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inpCls}
                      placeholder="name@university.edu"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full py-4 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-[20px] font-black tracking-widest uppercase text-sm shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-sm text-emerald-700 font-bold">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p>OTP sent to <span className="underline">{email}</span>. Please check your inbox.</p>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 ml-1">6-Digit OTP</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                      <KeyRound className="h-5 w-5 text-slate-300" />
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
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                      <Lock className="h-5 w-5 text-slate-300" />
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
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black tracking-widest uppercase text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
