import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, AlertTriangle, Building, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userBookingAPI } from '../../services/userApi';
import { incidentAPI } from '../../services/incidentApi';
import { facilityAPI } from '../../services/facilityApi';
import { Link } from 'react-router-dom';

const STATUS_STYLE = {
  PENDING:   'bg-amber-500/10 text-amber-400',
  APPROVED:  'bg-emerald-500/10 text-emerald-400',
  REJECTED:  'bg-red-500/10 text-red-400',
  CANCELLED: 'bg-neutral-500/10 text-neutral-400',
  OPEN:        'bg-blue-500/10 text-blue-400',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400',
  RESOLVED:    'bg-emerald-500/10 text-emerald-400',
  CLOSED:      'bg-neutral-500/10 text-neutral-400',
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
    { label: 'My Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', link: '/user/bookings' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', link: '/user/bookings' },
    { label: 'My Incidents', value: incidents.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', link: '/user/incidents' },
    { label: 'Active Facilities', value: facilities.length, icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/user/facilities' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back! 👋</h1>
            <p className="text-blue-300 text-sm">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={s.link} className="block bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl px-4 py-4 transition-colors group">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
                <p className="text-neutral-400 text-xs mt-1 group-hover:text-white transition-colors">{s.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-700">
            <h2 className="font-semibold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Recent Bookings</h2>
            <Link to="/user/bookings" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-neutral-600 text-sm">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-neutral-600 text-sm">No bookings yet. <Link to="/user/facilities" className="text-blue-400 hover:underline">Browse facilities</Link></div>
          ) : (
            <div className="divide-y divide-neutral-700">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{b.purpose}</p>
                    <p className="text-xs text-neutral-500">{fmt(b.startTime)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Incidents */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-700">
            <h2 className="font-semibold text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> My Incidents</h2>
            <Link to="/user/incidents" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-neutral-600 text-sm">Loading...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-neutral-600 text-sm">No incident tickets reported.</div>
          ) : (
            <div className="divide-y divide-neutral-700">
              {incidents.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{t.title}</p>
                    <p className="text-xs text-neutral-500">{t.ticketNumber} · {t.facilityName}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[t.status]}`}>
                    {(t.status || '').replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Facilities */}
      {!loading && facilities.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Building className="w-4 h-4 text-emerald-400" /> Available Facilities</h2>
            <Link to="/user/facilities" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Browse all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map(f => (
              <Link key={f.id} to="/user/facilities"
                className="bg-neutral-800 border border-neutral-700 hover:border-blue-500/30 rounded-xl p-4 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full">{(f.type || '').replace('_', ' ')}</span>
                  <span className="text-xs text-emerald-400">● Active</span>
                </div>
                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{f.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{f.location} · Cap: {f.capacity}</p>
                {f.costPerHour && <p className="text-xs text-blue-400 mt-1">LKR {f.costPerHour}/hr</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
