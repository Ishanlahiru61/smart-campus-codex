import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import loginBg from '../assets/login1.jpg';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      toast.success('Welcome back to Smart Campus!');
      const role = response.data.roles[0]?.replace('ROLE_', '');
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'TECHNICIAN') navigate('/tech/dashboard', { replace: true });
      else navigate('/user/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-jakarta overflow-hidden">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-[#F8FAFC] relative">
        {/* Dynamic Background Elements for form side */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] rounded-[32px] p-8 md:p-10 border border-slate-100/50 relative overflow-hidden backdrop-blur-sm">
            {/* Top Branding */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/20 rotate-12 transition-transform hover:rotate-0 duration-500">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Smart Campus</h1>
              <p className="text-slate-400 font-medium text-sm">Your gateway to a smarter experience</p>
            </div>

            {/* Social Login */}
            <button 
              onClick={() => window.location.href = 'http://localhost:8081/oauth2/authorization/google'}
              className="w-full py-3.5 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 mb-6 border border-slate-200/50 text-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-4 bg-white text-slate-400 font-bold tracking-widest uppercase">Or email login</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <Mail className="h-4 w-4 text-slate-300 group-focus-within:text-blue-500" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-slate-800 font-medium focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/20 outline-none transition-all text-sm"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <Lock className="h-4 w-4 text-slate-300 group-focus-within:text-blue-500" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-slate-800 font-medium focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/20 outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl shadow-slate-900/10 hover:shadow-blue-500/30 flex items-center justify-center gap-3 transition-all duration-500 disabled:opacity-50 mt-8 active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Dashboard'}
              </button>
            </form>

            {/* Bottom Footer */}
            <p className="text-center text-slate-400 text-xs font-medium mt-8">
              Don't have an account? <span className="text-slate-900 font-bold cursor-pointer hover:text-blue-600 transition-colors">Contact Administrator</span>
            </p>
          </div>
          <p className="text-center text-slate-400/60 text-[10px] font-bold uppercase tracking-[4px] mt-8">© 2026 Smart Campus System</p>
        </div>
      </div>

      {/* Right Side: Image Section */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-900">
        <img 
          src={loginBg} 
          alt="Smart Campus Life" 
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-[10s] ease-out opacity-90"
        />
        
        {/* Overlays for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
        
        {/* Branding Content on Image */}
        <div className="absolute bottom-20 left-20 right-20 text-white z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Smart Facility Management</span>
          </div>
          <h2 className="text-5xl xl:text-6xl font-black mb-6 leading-tight tracking-tighter">
            Transforming Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Campus Experience</span>
          </h2>
          <p className="text-xl text-slate-200/80 max-w-lg font-medium leading-relaxed">
            Efficiency meets innovation. Manage facilities, bookings, and incidents with our next-generation campus ecosystem.
          </p>
          
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-black text-white mb-1">99.9%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reliability</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="text-3xl font-black text-white mb-1">24/7</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Support</div>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-spin-slow pointer-events-none" />
      </div>

      <ForgotPasswordModal 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)} 
      />
    </div>
  );
}
