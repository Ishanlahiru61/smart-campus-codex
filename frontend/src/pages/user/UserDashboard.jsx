import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, AlertTriangle, Building, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userBookingAPI } from '../../services/userApi';
import { incidentAPI } from '../../services/incidentApi';
import { facilityAPI } from '../../services/facilityApi';
import { Link } from 'react-router-dom';

const STATUS_STYLE = {
  PENDING:   'bg-amber-50 text-amber-700',
  APPROVED:  'bg-emerald-50 text-emerald-700',
  REJECTED:  'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
  OPEN:        'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED:    'bg-emerald-50 text-emerald-700',
  CLOSED:      'bg-slate-100 text-slate-500',
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, iRes, fRes] = await Promise.allSettled([
          userBookingAPI.getMyBookings(),
          incidentAPI.getMyTickets(),
          facilityAPI.getAll(),
        ]);
        if (bRes.status === 'fulfilled') setBookings(bRes.value || []);
        if (iRes.status === 'fulfilled') {
          setIncidents(iRes.value?.data || []);
        }
        if (fRes.status === 'fulfilled') setFacilities((fRes.value?.data || []).filter(f => f.status === 'ACTIVE').slice(0, 6));
      } finally { setLoading(false); }
    };
    load();
  }, [user?.email]);

  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-LK', { dateStyle: 'medium' }) : '—';

  const statCards = [
    { label: 'My Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-500/10', link: '/user/bookings' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', link: '/user/bookings' },
    { label: 'My Incidents', value: incidents.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', link: '/user/incidents' },
    { label: 'Active Facilities', value: facilities.length, icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/user/facilities' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Welcome back! 👋</h1>
            <p className="text-slate-500 font-medium">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={s.link} className="block bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 rounded-[24px] p-6 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className={`text-4xl font-extrabold text-slate-800 mb-1`}>{loading ? '—' : s.value}</p>
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Recent Bookings</h2>
            <Link to="/user/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-full">View all</Link>
          </div>
          <div className="flex-1 p-2">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">No bookings yet. <Link to="/user/facilities" className="text-blue-600 hover:underline">Browse facilities</Link></div>
            ) : (
              <div className="space-y-1">
                {bookings.slice(0, 4).map(b => (
                  <div key={b.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{b.purpose}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{fmt(b.startTime)}</p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> My Incidents</h2>
            <Link to="/user/incidents" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-full">View all</Link>
          </div>
          <div className="flex-1 p-2">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">Loading...</div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">No incident tickets reported.</div>
            ) : (
              <div className="space-y-1">
                {incidents.slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{t.ticketNumber} · {t.facilityName}</p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${STATUS_STYLE[t.status]}`}>
                      {(t.status || '').replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Facilities */}
      {!loading && facilities.length > 0 && (
        <div className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Building className="w-5 h-5 text-emerald-500" /> Available Facilities</h2>
            <Link to="/user/facilities" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-full">Browse all</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map(f => (
              <Link key={f.id} to="/user/facilities"
                className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 rounded-[24px] p-6 transition-all duration-300 group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold tracking-wide bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{(f.type || '').replace('_', ' ')}</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">● Active</span>
                </div>
                <p className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{f.name}</p>
                <p className="text-sm font-medium text-slate-500 mt-2">{f.location} · Cap: {f.capacity}</p>
                {f.costPerHour && <p className="text-sm font-bold text-blue-600 mt-3">LKR {f.costPerHour}/hr</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
