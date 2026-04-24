import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, LayoutDashboard } from 'lucide-react';

export default function StartPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col font-inter overflow-hidden relative selection:bg-indigo-500/30">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

            {/* Navigation Bar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide">Smart Campus</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 text-sm font-medium text-white hover:text-indigo-200 transition-colors"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 text-sm font-medium bg-white text-neutral-900 hover:bg-indigo-50 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 text-center mt-[-4rem]">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-slide-up">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-200">The Future of Education Management</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 max-w-4xl animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                    Welcome to the central <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400">Operations Hub</span>
                </h1>
                
                <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                    Secure, scalable, and beautifully designed. Access your academic portal, manage resources, and engage with the university seamlessly.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-neutral-900 rounded-xl font-semibold text-lg hover:bg-neutral-100 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Access Secure Portal
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 backdrop-blur-md transition-all duration-300"
                    >
                        <LayoutDashboard className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                        View Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
