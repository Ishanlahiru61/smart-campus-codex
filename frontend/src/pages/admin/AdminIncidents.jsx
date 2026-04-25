import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, Loader2, X, Eye, Trash2,
  CheckCircle, UserCheck, UserX, MessageSquare,
} from 'lucide-react';
import { incidentAPI } from '../../services/incidentApi';
import { adminAPI } from '../../services/adminApi';
import { toast } from 'react-toastify';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const STATUS_STYLE = {
  OPEN:        'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED:    'bg-emerald-50 text-emerald-700',
  CLOSED:      'bg-slate-100 text-slate-500',
  REJECTED:    'bg-red-50 text-red-700',
};

const PRIORITY_STYLE = {
  CRITICAL: 'bg-red-50 text-red-700',
  HIGH:     'bg-orange-50 text-orange-700',
  MEDIUM:   'bg-amber-50 text-amber-700',
  LOW:      'bg-green-50 text-green-700',
};

function TicketModal({ ticket, technicians, onClose, onRefresh }) {
  const [status, setStatus]             = useState(ticket?.status || 'OPEN');
  const [resolutionNotes, setResNotes]  = useState(ticket?.resolutionNotes || '');
  const [rejectionReason, setRejReason] = useState('');
  const [techId, setTechId]             = useState(ticket?.assignedTechnician || '');
  const [comment, setComment]           = useState('');
  const [saving, setSaving]             = useState(false);

  if (!ticket) return null;
  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition-all";

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await incidentAPI.updateStatus(ticket.id, status, resolutionNotes || null, rejectionReason || null);
      toast.success('Status updated'); onRefresh(); onClose();
    } catch { toast.error('Failed to update status'); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    const selected = technicians.find(t => t.id === techId);
    if (!selected) { toast.warning('Select a technician first'); return; }
    setSaving(true);
    try {
      await adminAPI.assignTechnician(ticket.id, selected.email, selected.username || selected.email);
      toast.success('Technician assigned'); onRefresh(); onClose();
    } catch { toast.error('Failed to assign technician'); }
    finally { setSaving(false); }
  };

  const handleUnassign = async () => {
    setSaving(true);
    try {
      await incidentAPI.unassignTechnician(ticket.id);
      toast.success('Technician unassigned'); onRefresh(); onClose();
    } catch { toast.error('Failed to unassign'); }
    finally { setSaving(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await incidentAPI.addComment(ticket.id, comment, 'Admin');
      toast.success('Comment added'); setComment(''); onRefresh();
    } catch { toast.error('Failed to add comment'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex justify-between items-start px-8 py-6 border-b border-slate-50">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">{ticket.ticketNumber}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_STYLE[ticket.priority]}`}>{ticket.priority}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[ticket.status]}`}>{ticket.status}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Facility', ticket.facilityName || ticket.facilityId || '—'],
              ['Category', ticket.category || '—'],
              ['Reported By', ticket.reportedBy || '—'],
              ['Created', fmt(ticket.createdAt)],
              ['Assigned To', ticket.technicianName || 'Unassigned'],
              ['Resolved At', fmt(ticket.resolvedAt)],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{val}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
          </div>

          {ticket.attachments?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attachments</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {ticket.attachments.map(a => (
                  <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 group relative rounded-2xl overflow-hidden block w-20 h-20 shadow-sm">
                    <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Assign Technician */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-600" /> Assign Technician</p>
            <select value={techId} onChange={e => setTechId(e.target.value)} className={inp}>
              <option value="">— Select Technician —</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.username || t.email}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssign} disabled={saving || !techId}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Assign
              </button>
              {ticket.assignedTechnician && (
                <button onClick={handleUnassign} disabled={saving}
                  className="px-5 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  <UserX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-800">Update Status</p>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {(status === 'RESOLVED' || status === 'CLOSED') && (
              <textarea rows={2} value={resolutionNotes} onChange={e => setResNotes(e.target.value)}
                className={inp} placeholder="Resolution notes..." />
            )}
            {status === 'REJECTED' && (
              <textarea rows={2} value={rejectionReason} onChange={e => setRejReason(e.target.value)}
                className={inp} placeholder="Rejection reason..." />
            )}
            <button onClick={handleStatusUpdate} disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Status
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-600" /> Comments ({ticket.comments?.length || 0})</p>
            <div className="space-y-3">
              {(ticket.comments || []).map((c, i) => (
                <div key={c.id || i} className="bg-slate-50 rounded-xl px-4 py-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>{c.commentedBy} <span className="font-normal">({c.commentedByRole})</span></span>
                    <span>{fmt(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                placeholder="Add a comment..."
                value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button onClick={handleComment} disabled={!comment.trim() || saving}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminIncidents() {
  const [tickets, setTickets]         = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selected, setSelected]       = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

  const fetchTickets = async () => {
    try { setIsLoading(true); const res = await incidentAPI.getAll(); setTickets(res.data || []); }
    catch { toast.error('Failed to load incidents'); }
    finally { setIsLoading(false); }
  };
  const fetchTechnicians = async () => {
    try { const techs = await adminAPI.getTechnicians(); setTechnicians(techs); } catch { /* silent */ }
  };
  useEffect(() => { fetchTickets(); fetchTechnicians(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incident permanently?')) return;
    try {
      setDeletingId(id);
      await incidentAPI.delete(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Incident deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      t.title?.toLowerCase().includes(q) || t.ticketNumber?.toLowerCase().includes(q) ||
      t.facilityName?.toLowerCase().includes(q) || t.reportedBy?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q);
    const matchStatus   = !filterStatus   || t.status   === filterStatus;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const counts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-500" /> Incident Management
        </h1>
        <p className="text-slate-500 font-medium mt-2">Manage, assign, and resolve campus incident tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: tickets.length, icon: '📋', color: 'text-slate-800' },
          { label: 'Open', value: counts.OPEN || 0, icon: '🔵', color: 'text-blue-700' },
          { label: 'In Progress', value: counts.IN_PROGRESS || 0, icon: '⚙️', color: 'text-amber-700' },
          { label: 'Resolved', value: counts.RESOLVED || 0, icon: '✅', color: 'text-emerald-700' },
          { label: 'Rejected', value: counts.REJECTED || 0, icon: '❌', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-5">
            <span className="text-xl mb-2 block">{s.icon}</span>
            <p className={`text-3xl font-extrabold ${s.color} mb-0.5`}>{s.value}</p>
            <p className="text-xs font-semibold text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by title, ticket#, facility, reporter..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm text-slate-700 font-semibold outline-none w-full sm:w-44">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm text-slate-700 font-semibold outline-none w-full sm:w-40">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <p className="text-sm font-semibold text-slate-400 shrink-0">{filtered.length} of {tickets.length}</p>
      </div>

      {/* Table */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No incidents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Facility</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800">{t.title}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{t.ticketNumber} · {t.category || '—'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-600 text-sm">{t.facilityName || '—'}</td>
                    <td className="px-8 py-5">
                      {t.technicianName
                        ? <span className="text-sm font-bold text-blue-600">{t.technicianName}</span>
                        : <span className="text-sm font-semibold text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLE[t.status]}`}>
                        {(t.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-semibold text-slate-400">{fmt(t.createdAt)}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelected(t)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="View / Manage">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} disabled={!!deletingId}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50" title="Delete">
                          {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <TicketModal ticket={selected} technicians={technicians} onClose={() => setSelected(null)} onRefresh={fetchTickets} />
        )}
      </AnimatePresence>
    </div>
  );
}
