import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, AlertTriangle, Loader2, X, CheckCircle, Clock, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { technicianAPI } from '../../services/technicianApi';
import { toast } from 'react-toastify';

const STATUSES = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_STYLE = {
  OPEN:        'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED:    'bg-emerald-50 text-emerald-700',
  CLOSED:      'bg-slate-100 text-slate-500',
  REJECTED:    'bg-red-50 text-red-700',
};

const PRIORITY_COLOR = {
  CRITICAL: 'text-red-600',
  HIGH:     'text-orange-600',
  MEDIUM:   'text-amber-600',
  LOW:      'text-emerald-600',
};

// ── Ticket detail/action modal ────────────────────────────────
function TicketModal({ ticket, onClose, onRefresh }) {
  const [status, setStatus]           = useState(ticket.status);
  const [resolutionNotes, setResNotes]= useState(ticket.resolutionNotes || '');
  const [comment, setComment]         = useState('');
  const [saving, setSaving]           = useState(false);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await technicianAPI.updateStatus(ticket.id, status, resolutionNotes);
      toast.success('Status updated successfully');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setSaving(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await technicianAPI.addComment(ticket.id, comment);
      toast.success('Comment added');
      setComment('');
      onRefresh();
    } catch { toast.error('Failed to add comment'); }
    finally { setSaving(false); }
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const inp = "w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400 transition-all font-medium";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] w-full max-w-2xl overflow-hidden my-4">

        {/* Header */}
        <div className="flex justify-between items-start px-8 py-6 border-b border-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono font-bold text-slate-400">{ticket.ticketNumber}</span>
              <span className={`text-[10px] font-black tracking-widest ${PRIORITY_COLOR[ticket.priority]}`}>{ticket.priority}</span>
              <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full ${STATUS_STYLE[ticket.status]}`}>{ticket.status?.replace('_', ' ')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['Facility', ticket.facilityName || '—'],
              ['Category', ticket.category || '—'],
              ['Reported By', ticket.reportedBy || '—'],
              ['Reporter Email', ticket.reportedByEmail || '—'],
              ['Created', fmt(ticket.createdAt)],
              ['Updated', fmt(ticket.updatedAt)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-700">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Description</p>
            <p className="text-sm font-medium text-slate-600 bg-slate-50 rounded-2xl px-5 py-4 leading-relaxed">{ticket.description}</p>
          </div>

          {ticket.attachments?.length > 0 && (
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Attachments</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {ticket.attachments.map(a => (
                  <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 group relative rounded-2xl overflow-hidden border-0 block w-24 h-24 shadow-sm hover:shadow-md transition-shadow">
                    <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-slate-50 rounded-[24px] p-6 space-y-4">
            <p className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Update Status
            </p>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {(status === 'RESOLVED' || status === 'CLOSED') && (
              <textarea rows={2} value={resolutionNotes} onChange={e => setResNotes(e.target.value)}
                className={inp} placeholder="Add resolution notes..." />
            )}
            <button onClick={handleStatusUpdate} disabled={saving}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Status Update
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <p className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Comments ({ticket.comments?.length || 0})
            </p>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
              {(ticket.comments || []).map((c, i) => (
                <div key={c.id || i} className="bg-slate-50 rounded-2xl px-5 py-4">
                  <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                    <span>{c.commentedBy} <span className="text-blue-600">({c.commentedByRole})</span></span>
                    <span>{fmt(c.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">{c.content}</p>
                </div>
              ))}
              {(!ticket.comments || ticket.comments.length === 0) && (
                <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-4 text-center">No comments yet.</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <input className="flex-1 bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400 font-medium transition-all"
                placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()} />
              <button onClick={handleComment} disabled={!comment.trim() || saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold disabled:opacity-50 transition-all shadow-md shadow-blue-500/10">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Technician Dashboard ─────────────────────────────────
export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await technicianAPI.getAssignedTickets();
      setTickets(res.data || []);
    } catch { toast.error('Failed to load tickets'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || 
      t.title?.toLowerCase().includes(q) || 
      t.ticketNumber?.toLowerCase().includes(q) || 
      t.facilityName?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = tickets.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});
  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-LK', { dateStyle: 'medium' }) : '—';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] px-8 py-8 flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-orange-500/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Technician Dashboard 🔧</h1>
            <p className="text-slate-500 font-medium">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { label: 'Assigned', value: tickets.length, icon: '📋', color: 'text-slate-800' },
          { label: 'Open', value: counts.OPEN || 0, icon: '🔵', color: 'text-blue-600' },
          { label: 'In Progress', value: counts.IN_PROGRESS || 0, icon: '⏳', color: 'text-amber-700' },
          { label: 'Resolved', value: (counts.RESOLVED || 0) + (counts.CLOSED || 0), icon: '✅', color: 'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by title, ticket# or facility..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400 font-medium transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 ${filterStatus === s ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {s ? s.replace('_', ' ') : 'All Tickets'}
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-slate-400 shrink-0">{filtered.length} matching</p>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-400 text-sm font-bold animate-pulse uppercase tracking-widest">Fetching assignments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] text-slate-400 border border-dashed border-slate-200">
          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="text-xl font-extrabold text-slate-800">All caught up!</p>
          <p className="text-sm font-medium opacity-60 mt-2">No assigned tickets matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filtered.map(t => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -4 }}
              className="group bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] rounded-[24px] px-8 py-6 transition-all duration-300 cursor-pointer border-0"
              onClick={() => setSelected(t)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${STATUS_STYLE[t.status]}`}>
                      {(t.status || '').replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-black tracking-widest uppercase ${PRIORITY_COLOR[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">#{t.ticketNumber}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{t.title}</h3>
                  <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg"><Building className="w-3.5 h-3.5" /> {t.facilityName || 'General'}</span>
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg"><Clock className="w-3.5 h-3.5" /> {fmt(t.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {t.comments?.length > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600">
                      <MessageSquare className="w-4 h-4" /> {t.comments.length}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black tracking-widest transition-all group-hover:bg-orange-600 shadow-md">
                    MANAGE <Search className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <TicketModal ticket={selected} onClose={() => setSelected(null)} onRefresh={fetchTickets} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for Building icon (not imported from lucide)
function Building({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>
    </svg>
  );
}
