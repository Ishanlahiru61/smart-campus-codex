import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, Loader2, X, Eye, Trash2,
  CheckCircle, UserCheck, UserX, ChevronDown, MessageSquare,
} from 'lucide-react';
import { incidentAPI } from '../../services/incidentApi';
import { adminAPI } from '../../services/adminApi';
import { toast } from 'react-toastify';

// ── constants ────────────────────────────────────────────────
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const STATUS_STYLE = {
  OPEN:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLVED:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED:      'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  REJECTED:    'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_STYLE = {
  CRITICAL: 'text-red-400',
  HIGH:     'text-orange-400',
  MEDIUM:   'text-amber-400',
  LOW:      'text-green-400',
};

// ── Ticket Detail / Manage Modal ─────────────────────────────
function TicketModal({ ticket, technicians, onClose, onRefresh }) {
  const [status, setStatus]             = useState(ticket?.status || 'OPEN');
  const [resolutionNotes, setResNotes]  = useState(ticket?.resolutionNotes || '');
  const [rejectionReason, setRejReason] = useState('');
  const [techId, setTechId]             = useState(ticket?.assignedTechnician || '');
  const [techName, setTechName]         = useState(ticket?.technicianName || '');
  const [comment, setComment]           = useState('');
  const [saving, setSaving]             = useState(false);

  if (!ticket) return null;

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

  const handleStatusUpdate = async () => {
    if (!status) return;
    setSaving(true);
    try {
      await incidentAPI.updateStatus(
        ticket.id, status,
        resolutionNotes || null,
        rejectionReason || null,
      );
      toast.success('Status updated');
      onRefresh();
      onClose();
    } catch { toast.error('Failed to update status'); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    const selected = technicians.find(t => t.id === techId);
    if (!selected) { toast.warning('Select a technician first'); return; }
    setSaving(true);
    try {
      // Use email as the identifier for assignment because backend TechnicianService filters by auth.getName() (email)
      await adminAPI.assignTechnician(ticket.id, selected.email, selected.username || selected.email);
      toast.success('Technician assigned');
      onRefresh();
      onClose();
    } catch { toast.error('Failed to assign technician'); }
    finally { setSaving(false); }
  };

  const handleUnassign = async () => {
    setSaving(true);
    try {
      await incidentAPI.unassignTechnician(ticket.id);
      toast.success('Technician unassigned');
      onRefresh();
      onClose();
    } catch { toast.error('Failed to unassign'); }
    finally { setSaving(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await incidentAPI.addComment(ticket.id, comment, 'Admin');
      toast.success('Comment added');
      setComment('');
      onRefresh();
    } catch { toast.error('Failed to add comment'); }
    finally { setSaving(false); }
  };

  const inp = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl shadow-2xl my-4"
      >
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-neutral-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-500">{ticket.ticketNumber}</span>
              <span className={`text-xs font-bold ${PRIORITY_STYLE[ticket.priority]}`}>{ticket.priority}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[ticket.status]}`}>{ticket.status}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Facility', ticket.facilityName || ticket.facilityId || '—'],
              ['Category', ticket.category || '—'],
              ['Reported By', ticket.reportedBy || '—'],
              ['Created', fmt(ticket.createdAt)],
              ['Assigned To', ticket.technicianName || 'Unassigned'],
              ['Resolved At', fmt(ticket.resolvedAt)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-neutral-500 text-xs">{label}</p>
                <p className="text-white">{val}</p>
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

          {/* Assign Technician */}
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-400" /> Assign Technician</p>
            <select
              value={techId}
              onChange={e => {
                setTechId(e.target.value);
                const t = technicians.find(x => x.id === e.target.value);
                setTechName(t?.username || t?.email || '');
              }}
              className={inp}
            >
              <option value="">— Select Technician —</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.username || t.email}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={handleAssign} disabled={saving || !techId} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Assign
              </button>
              {ticket.assignedTechnician && (
                <button onClick={handleUnassign} disabled={saving} className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors disabled:opacity-50">
                  <UserX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-white">Update Status</p>
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
            <button onClick={handleStatusUpdate} disabled={saving} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Status
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-400" /> Comments ({ticket.comments?.length || 0})</p>
            {(ticket.comments || []).map((c, i) => (
              <div key={c.id || i} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>{c.commentedBy} <span className="text-neutral-600">({c.commentedByRole})</span></span>
                  <span>{fmt(c.createdAt)}</span>
                </div>
                <p className="text-sm text-neutral-300">{c.content}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button onClick={handleComment} disabled={!comment.trim() || saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
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
    try {
      setIsLoading(true);
      const res = await incidentAPI.getAll();
      setTickets(res.data || []);
    } catch { toast.error('Failed to load incidents'); }
    finally { setIsLoading(false); }
  };

  const fetchTechnicians = async () => {
    try {
      const techs = await adminAPI.getTechnicians();
      setTechnicians(techs);
    } catch { /* silent */ }
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
      t.title?.toLowerCase().includes(q) ||
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.facilityName?.toLowerCase().includes(q) ||
      t.reportedBy?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q);
    const matchStatus   = !filterStatus   || t.status   === filterStatus;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const counts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Incident Management
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Manage, assign, and resolve campus incident tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',       value: tickets.length,         color: 'text-blue-400' },
          { label: 'Open',        value: counts.OPEN || 0,       color: 'text-blue-300' },
          { label: 'In Progress', value: counts.IN_PROGRESS || 0,color: 'text-amber-400' },
          { label: 'Resolved',    value: counts.RESOLVED || 0,   color: 'text-emerald-400' },
          { label: 'Rejected',    value: counts.REJECTED || 0,   color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3">
            <p className="text-neutral-500 text-xs">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text" placeholder="Search by title, ticket#, facility, reporter..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-full sm:w-40">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-full sm:w-36">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <p className="text-sm text-neutral-500 shrink-0">{filtered.length} of {tickets.length}</p>
      </div>

      {/* Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No incidents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-900/50 text-neutral-400 border-b border-neutral-700">
                <tr>
                  <th className="px-5 py-3 font-medium">Ticket</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Assigned To</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filtered.map(t => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-700/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{t.title}</div>
                      <div className="text-xs text-neutral-500">{t.ticketNumber} · {t.category || '—'}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="px-5 py-3 text-neutral-300 text-xs">{t.facilityName || '—'}</td>
                    <td className="px-5 py-3">
                      {t.technicianName
                        ? <span className="text-xs text-blue-300">{t.technicianName}</span>
                        : <span className="text-xs text-neutral-600 italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[t.status]}`}>
                        {(t.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-500">{fmt(t.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelected(t)}
                          className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="View / Manage"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={!!deletingId}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === t.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
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

      {/* Ticket Management Modal */}
      <AnimatePresence>
        {selected && (
          <TicketModal
            ticket={selected}
            technicians={technicians}
            onClose={() => setSelected(null)}
            onRefresh={fetchTickets}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
