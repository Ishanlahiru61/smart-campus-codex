import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Search, UserPlus, Loader2, X, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';
import { incidentAPI } from '../../services/incidentApi';
import { toast } from 'react-toastify';

const TICKET_STATUS_STYLE = {
  OPEN:        'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED:    'bg-emerald-50 text-emerald-700',
  CLOSED:      'bg-slate-100 text-slate-500',
  REJECTED:    'bg-red-50 text-red-700',
};
const PRIORITY_COLOR = {
  CRITICAL: 'bg-red-50 text-red-700',
  HIGH:     'bg-orange-50 text-orange-700',
  MEDIUM:   'bg-amber-50 text-amber-700',
  LOW:      'bg-green-50 text-green-700',
};

function TechnicianTicketsPanel({ tech, onClose }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await incidentAPI.getAll();
        const all = res.data || [];
        setTickets(all.filter(t =>
          t.assignedTechnician === tech.id ||
          t.assignedTechnician === tech.email ||
          t.technicianName === tech.username ||
          t.technicianName === tech.email
        ));
      } catch { toast.error('Failed to load tickets'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [tech.id]);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] w-full max-w-2xl">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{tech.username || tech.email}</h3>
            <p className="text-sm font-medium text-slate-400">{tech.email} · {tickets.length} assigned tickets</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No tickets assigned to this technician.</p>
            </div>
          ) : tickets.map(t => (
            <div key={t.id} className="bg-slate-50 rounded-2xl px-5 py-4 flex justify-between items-center hover:bg-slate-100 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                  <span className="text-xs font-mono font-semibold text-slate-400">{t.ticketNumber}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{t.title}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{t.facilityName || '—'} · {t.category}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${TICKET_STATUS_STYLE[t.status]}`}>
                {(t.status || '').replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AddTechnicianModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createUser({ ...form, role: 'TECHNICIAN' });
      toast.success('Technician account created!');
      onCreated(); onClose();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to create technician');
    } finally { setSaving(false); }
  };

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400 transition-all";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" /> Add Technician
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input required type="text" className={inp} value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. John Silva" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
            <input required type="email" className={inp} value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tech@campus.lk" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <input required type="password" minLength={6} className={inp} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Technician
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewingTech, setViewingTech]   = useState(null);
  const [togglingId, setTogglingId]     = useState(null);

  const fetchTechnicians = async () => {
    try {
      setIsLoading(true);
      const res = await adminAPI.getAllUsers();
      const techs = (res.data || []).filter(u => u.roles?.some(r => r.includes('TECHNICIAN')));
      setTechnicians(techs);
    } catch { toast.error('Failed to load technicians'); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchTechnicians(); }, []);

  const handleToggleStatus = async (id, current) => {
    try {
      setTogglingId(id);
      await adminAPI.updateUserStatus(id, !current);
      setTechnicians(prev => prev.map(t => t.id === id ? { ...t, enabled: !current } : t));
      toast.success(`Technician ${!current ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to update status'); }
    finally { setTogglingId(null); }
  };

  const filtered = technicians.filter(t => {
    const q = search.toLowerCase();
    return !search || t.username?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q);
  });

  const activeCount   = technicians.filter(t => t.enabled).length;
  const disabledCount = technicians.filter(t => !t.enabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Wrench className="w-7 h-7 text-orange-500" /> Technician Management
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage technician accounts and view their assigned tickets</p>
        </div>
        <button onClick={() => setAddModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all font-bold text-sm shrink-0 shadow-md shadow-orange-500/20">
          <UserPlus className="w-4 h-4" /> Add Technician
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Technicians', value: technicians.length, icon: '🔧', color: 'text-slate-800' },
          { label: 'Active', value: activeCount, icon: '✅', color: 'text-emerald-700' },
          { label: 'Disabled', value: disabledCount, icon: '🚫', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6">
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-400 shrink-0">{filtered.length} of {technicians.length}</p>
      </div>

      {/* Technician Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] text-slate-400">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold mb-3">No technicians found.</p>
          <button onClick={() => setAddModalOpen(true)} className="text-orange-500 hover:text-orange-600 text-sm font-bold underline">
            Add the first technician
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(tech => (
            <motion.div key={tech.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 rounded-[24px] p-6 transition-all duration-300">

              {/* Avatar + Info */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md shadow-orange-500/20">
                  {(tech.username || tech.email).charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-lg font-bold text-slate-800 truncate">{tech.username || 'N/A'}</p>
                  <p className="text-sm font-medium text-slate-400 truncate">{tech.email}</p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(tech.roles || []).map(r => (
                  <span key={r} className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Wrench className="w-3 h-3" />{r.replace('ROLE_', '')}
                  </span>
                ))}
              </div>

              {/* Status + Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <button onClick={() => handleToggleStatus(tech.id, tech.enabled)} disabled={togglingId === tech.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    tech.enabled
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}>
                  {togglingId === tech.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : tech.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {tech.enabled ? 'Active' : 'Disabled'}
                </button>

                <button onClick={() => setViewingTech(tech)}
                  className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors">
                  <AlertTriangle className="w-4 h-4" /> Tickets
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {addModalOpen && <AddTechnicianModal onClose={() => setAddModalOpen(false)} onCreated={fetchTechnicians} />}
        {viewingTech && <TechnicianTicketsPanel tech={viewingTech} onClose={() => setViewingTech(null)} />}
      </AnimatePresence>
    </div>
  );
}
