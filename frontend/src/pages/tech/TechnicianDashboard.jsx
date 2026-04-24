import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, AlertTriangle, Loader2, X, CheckCircle, Clock, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { technicianAPI } from '../../services/technicianApi';
import { toast } from 'react-toastify';

const STATUSES = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_STYLE = {
  OPEN:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLVED:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED:      'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  REJECTED:    'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_COLOR = {
  CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-amber-400', LOW: 'text-green-400',
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

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';
  const inp = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder-neutral-500";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl shadow-2xl my-4">

        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-neutral-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-neutral-500">{ticket.ticketNumber}</span>
              <span className={`text-xs font-bold ${PRIORITY_COLOR[ticket.priority]}`}>{ticket.priority}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[ticket.status]}`}>{ticket.status?.replace('_', ' ')}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Facility', ticket.facilityName || '—'],
              ['Category', ticket.category || '—'],
              ['Reported By', ticket.reportedBy || '—'],
              ['Reporter Email', ticket.reportedByEmail || '—'],
              ['Created', fmt(ticket.createdAt)],
              ['Updated', fmt(ticket.updatedAt)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-neutral-500 text-xs">{label}</p>
                <p className="text-white text-sm">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-1">Description</p>
            <p className="text-sm text-neutral-300 bg-neutral-800 rounded-lg px-3 py-2">{ticket.description}</p>
          </div>

          {ticket.attachments?.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 mb-2">Attachments</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ticket.attachments.map(a => (
                  <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 group relative rounded-lg overflow-hidden border border-neutral-700 block w-20 h-20">
                    <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Update Status
            </p>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {(status === 'RESOLVED' || status === 'CLOSED') && (
              <textarea rows={2} value={resolutionNotes} onChange={e => setResNotes(e.target.value)}
                className={inp} placeholder="Add resolution notes..." />
            )}
            <button onClick={handleStatusUpdate} disabled={saving}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Status
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Comments ({ticket.comments?.length || 0})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(ticket.comments || []).map((c, i) => (
                <div key={c.id || i} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>{c.commentedBy} <span className="text-neutral-600">({c.commentedByRole})</span></span>
                    <span>{fmt(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-neutral-300">{c.content}</p>
                </div>
              ))}
              {(!ticket.comments || ticket.comments.length === 0) && (
                <p className="text-xs text-neutral-600 italic">No comments yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder-neutral-500"
                placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()} />
              <button onClick={handleComment} disabled={!comment.trim() || saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition-colors">
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
        className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/20 rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xl font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Technician Dashboard 🔧</h1>
            <p className="text-orange-300 text-sm">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Assigned', value: tickets.length, color: 'text-orange-400' },
          { label: 'Open', value: counts.OPEN || 0, color: 'text-blue-400' },
          { label: 'In Progress', value: counts.IN_PROGRESS || 0, color: 'text-amber-400' },
          { label: 'Resolved', value: (counts.RESOLVED || 0) + (counts.CLOSED || 0), color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 shadow-lg hover:border-orange-500/30 transition-colors">
            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-neutral-800/80 backdrop-blur-md border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search by title, ticket# or facility..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filterStatus === s ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'}`}>
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
        <p className="text-sm text-neutral-500 shrink-0 font-medium">{filtered.length} tickets</p>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-400" />
          <p className="text-neutral-500 text-sm animate-pulse">Fetching assigned tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-neutral-800/50 border border-neutral-700 border-dashed rounded-2xl text-neutral-500">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm opacity-60">No assigned tickets matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(t => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.005 }}
              className="group bg-neutral-800 border border-neutral-700 hover:border-orange-500/40 rounded-2xl px-6 py-5 transition-all cursor-pointer shadow-md hover:shadow-xl hover:shadow-orange-900/5"
              onClick={() => setSelected(t)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${STATUS_STYLE[t.status]}`}>
                      {(t.status || '').replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-black tracking-tighter ${PRIORITY_COLOR[t.priority]}`}>
                      {t.priority} PRIORITY
                    </span>
                    <span className="text-xs font-mono text-neutral-600">#{t.ticketNumber}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {t.facilityName || 'General'}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {fmt(t.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {t.comments?.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-neutral-900/50 px-2 py-1 rounded-md text-xs text-neutral-400 border border-neutral-700/50">
                      <MessageSquare className="w-3.5 h-3.5" /> {t.comments.length}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-600/10 text-orange-400 rounded-lg text-xs font-bold group-hover:bg-orange-600 group-hover:text-white transition-all">
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
