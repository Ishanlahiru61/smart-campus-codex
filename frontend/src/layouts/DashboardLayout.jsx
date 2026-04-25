import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Users, Building, Calendar, AlertTriangle, Wrench, LogOut } from 'lucide-react';
import NotificationBell from '../components/common/NotificationBell';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const getNavigation = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Facilities', path: '/admin/facilities', icon: Building },
          { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
          { name: 'Incidents', path: '/admin/incidents', icon: AlertTriangle },
          { name: 'Technicians', path: '/admin/technicians', icon: Wrench },
        ];
      case 'TECHNICIAN':
        return [
          { name: 'Dashboard', path: '/tech/dashboard', icon: Home },
        ];
      case 'USER':
      default:
        return [
          { name: 'Dashboard', path: '/user/dashboard', icon: Home },
          { name: 'Facilities', path: '/user/facilities', icon: Building },
          { name: 'My Bookings', path: '/user/bookings', icon: Calendar },
          { name: 'My Incidents', path: '/user/incidents', icon: AlertTriangle },
        ];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-transparent/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col p-4`}>
        <div className="flex-1 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="h-20 flex items-center px-8 border-b border-slate-50 justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Smart Campus</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-800">
              <X className="w-6 h-6" />
            </button>
          </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-5 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-5 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md flex items-center justify-center text-white font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
              <p className="text-xs font-medium text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 shrink-0 relative z-50">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-slate-800 mr-4 p-2 bg-white rounded-full shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="md:hidden text-lg font-bold text-slate-800">Smart Campus</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
