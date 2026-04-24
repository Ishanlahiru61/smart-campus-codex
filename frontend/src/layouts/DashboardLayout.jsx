import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Users, Building, Calendar, AlertTriangle, Wrench, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-900 text-white flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-neutral-800 border-r border-neutral-700 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-neutral-700 justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Smart Campus</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-neutral-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar (Mobile only) */}
        <header className="md:hidden h-16 border-b border-neutral-700 bg-neutral-800 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 text-lg font-bold text-white">Smart Campus</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
