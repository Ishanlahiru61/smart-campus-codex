import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Search, UserPlus, Loader2, X, Eye, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, User, Shield,
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';
import { incidentAPI } from '../../services/incidentApi';
import { toast } from 'react-toastify';

// ── Ticket panel shown when clicking a technician ────────────
function TechnicianTicketsPanel({ tech, onClose }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await incidentAPI.getAll();
        const all = res.data || [];
        setTickets(all.filter(t => t.assignedTechnician === tech.id));
      } catch { toast.error('Failed to load tickets'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [tech.id]);

  const STATUS_STYLE = {
    OPEN:        'bg-blue-500/10 text-blue-400',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-400',
    RESOLVED:    'bg-emerald-500/10 text-emerald-400',
    CLOSED:      'bg-neutral-500/10 text-neutral-400',
    REJECTED:    'bg-red-500/10 text-red-400',
  };

  const PRIORITY_COLOR = { CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-amber-400', LOW: 'text-green-400' };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl shadow-2xl"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-700">
          <div>
            <h3 className="text-lg font-bold text-white">{tech.username || tech.email}</h3>
            <p className="text-xs text-neutral-500">{tech.email} · Assigned tickets: {tickets.length}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-blue-400" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tickets assigned to this technician.</p>
            </div>
          ) : tickets.map(t => (
            <div key={t.id} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                  <span className="text-xs text-neutral-500">{t.ticketNumber}</span>
                </div>
                <p className="text-sm font-medium text-white mt-0.5">{t.title}</p>
                <p className="text-xs text-neutral-500">{t.facilityName || '—'} · {t.category}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[t.status]}`}>
                {(t.status || '').replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Add Technician Modal ──────────────────────────────────────
function AddTechnicianModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createUser({ ...form, role: 'TECHNICIAN' });
      toast.success('Technician account created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to create technician');
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-neutral-500";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" /> Add Technician
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
            <input required type="text" className={inp} value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. John Silva" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Email</label>
            <input required type="email" className={inp} value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tech@campus.lk" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Password</label>
            <input required type="password" minLength={6} className={inp} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Technician
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
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
      const techs = (res.data || []).filter(u =>
        u.roles?.some(r => r.includes('TECHNICIAN'))
      );
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
    return !search ||
      t.username?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q);
  });

  const activeCount   = technicians.filter(t => t.enabled).length;
  const disabledCount = technicians.filter(t => !t.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-400" />
            Technician Management
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Manage technician accounts and view their assigned tickets</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add Technician
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: technicians.length, color: 'text-orange-400' },
          { label: 'Active', value: activeCount, color: 'text-emerald-400' },
          { label: 'Disabled', value: disabledCount, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3">
            <p className="text-neutral-500 text-xs">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <p className="text-sm text-neutral-500 shrink-0">{filtered.length} of {technicians.length}</p>
      </div>

      {/* Technician Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-500">
          <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No technicians found.</p>
          <button onClick={() => setAddModalOpen(true)} className="mt-3 text-orange-400 hover:text-orange-300 text-sm underline">
            Add the first technician
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(tech => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 hover:border-orange-500/30 transition-colors"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0">
                  {(tech.username || tech.email).charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-white truncate">{tech.username || 'N/A'}</p>
                  <p className="text-xs text-neutral-500 truncate">{tech.email}</p>
                </div>
              </div>

              {/* Roles */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(tech.roles || []).map(r => (
                  <span key={r} className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Wrench className="w-3 h-3" />{r.replace('ROLE_', '')}
                  </span>
                ))}
              </div>

              {/* Status + Actions */}
              <div className="flex items-center justify-between">
                {/* Status toggle */}
                <button
                  onClick={() => handleToggleStatus(tech.id, tech.enabled)}
                  disabled={togglingId === tech.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    tech.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  }`}
                >
                  {togglingId === tech.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : tech.enabled
                      ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : <XCircle className="w-3.5 h-3.5" />}
                  {tech.enabled ? 'Active' : 'Disabled'}
                </button>

                {/* View tickets */}
                <button
                  onClick={() => setViewingTech(tech)}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-orange-400 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> View Tickets
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {addModalOpen && (
          <AddTechnicianModal onClose={() => setAddModalOpen(false)} onCreated={fetchTechnicians} />
        )}
        {viewingTech && (
          <TechnicianTicketsPanel tech={viewingTech} onClose={() => setViewingTech(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
