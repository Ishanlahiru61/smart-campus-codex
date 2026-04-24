import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, Loader2, X, Search } from 'lucide-react';
import { userIncidentAPI } from '../../services/userApi';
import { incidentAPI } from '../../services/incidentApi';
import { facilityAPI } from '../../services/facilityApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'STRUCTURAL', 'EQUIPMENT', 'SAFETY', 'CLEANING', 'IT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

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

function ReportModal({ facilities, user, onClose, onCreated }) {
  const [form, setForm] = useState({
    facilityId: '', facilityName: '', category: 'ELECTRICAL',
    title: '', description: '', priority: 'MEDIUM',
    reportedBy: user?.email || '', reportedByEmail: user?.email || '', reportedByPhone: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFacilityChange = (id) => {
    const f = facilities.find(x => x.id === id);
    set('facilityId', id);
    set('facilityName', f?.name || '');
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 3) {
      toast.warning('Maximum 3 images allowed');
      return;
    }
    const newFiles = [...files, ...selected].slice(0, 3);
    setFiles(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.facilityId) { toast.warning('Please select a facility'); return; }
    setSaving(true);
    try {
      const payload = {
        facilityId: form.facilityId,
        facilityName: form.facilityName,
        category: form.category,
        title: form.title,
        description: form.description,
        priority: form.priority,
        reportedBy: form.reportedBy,
        // Send null for optional fields when empty — @Pattern/@Email skip null
        reportedByEmail: form.reportedByEmail || null,
        reportedByPhone: form.reportedByPhone || null,
      };
      
      const formData = new FormData();
      formData.append('incident', JSON.stringify(payload));
      files.forEach(f => formData.append('files', f));
      
      await userIncidentAPI.create(formData);
      toast.success('Incident reported successfully!');
      onCreated();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to report incident';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-neutral-500";
  const lbl = "block text-xs font-medium text-neutral-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg shadow-2xl my-4">

        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Report Incident
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Facility */}
          <div>
            <label className={lbl}>Facility *</label>
            <select required className={inp} value={form.facilityId} onChange={e => handleFacilityChange(e.target.value)}>
              <option value="">— Select Facility —</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.location})</option>)}
            </select>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Category *</label>
              <select required className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Priority *</label>
              <select required className={inp} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={lbl}>Title *</label>
            <input required minLength={5} maxLength={100} className={inp} value={form.title}
              onChange={e => set('title', e.target.value)} placeholder="Brief title of the incident" />
          </div>

          {/* Description */}
          <div>
            <label className={lbl}>Description *</label>
            <textarea required minLength={10} maxLength={1000} rows={3} className={inp} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Describe the issue in detail..." />
          </div>

          {/* Images */}
          <div>
            <label className={lbl}>Images (Max 3)</label>
            <input type="file" accept="image/png, image/jpeg" multiple onChange={handleFileChange} className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer focus:outline-none mb-3" />
            {previews.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0">
                    <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg border border-neutral-700" />
                    <button type="button" onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Your Name *</label>
              <input required className={inp} value={form.reportedBy}
                onChange={e => set('reportedBy', e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className={lbl}>Phone (optional)</label>
              <input className={inp} value={form.reportedByPhone}
                onChange={e => set('reportedByPhone', e.target.value)} placeholder="0771234567" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Submit Report
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function UserIncidents() {
  const { user } = useAuth();
  const [tickets, setTickets]     = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [iRes, fRes] = await Promise.allSettled([
        incidentAPI.getMyTickets(),   // server-side filtered by JWT email
        facilityAPI.getAll(),
      ]);
      if (iRes.status === 'fulfilled') {
        setTickets(iRes.value?.data || []);
      }
      if (fRes.status === 'fulfilled') {
        setFacilities((fRes.value?.data || []).filter(f => f.status === 'ACTIVE'));
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.title?.toLowerCase().includes(q) || t.ticketNumber?.toLowerCase().includes(q) || t.facilityName?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = tickets.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});
  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-LK', { dateStyle: 'medium' }) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" /> My Incidents
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Report and track campus facility issues</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm shrink-0">
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: tickets.length, color: 'text-blue-400' },
          { label: 'Open', value: (counts.OPEN || 0) + (counts.IN_PROGRESS || 0), color: 'text-amber-400' },
          { label: 'Resolved', value: (counts.RESOLVED || 0) + (counts.CLOSED || 0), color: 'text-emerald-400' },
          { label: 'Rejected', value: counts.REJECTED || 0, color: 'text-red-400' },
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
          <input type="text" placeholder="Search by title, ticket# or facility..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white'}`}>
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-500">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No incident reports found.</p>
          <button onClick={() => setModalOpen(true)} className="mt-3 text-amber-400 hover:text-amber-300 text-sm underline">
            Report your first issue
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[t.status]}`}>
                      {(t.status || '').replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-bold ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                    <span className="text-xs text-neutral-600">{t.ticketNumber}</span>
                  </div>
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    📍 {t.facilityName} · 🏷 {t.category} · 📅 {fmt(t.createdAt)}
                  </p>
                  {t.technicianName && (
                    <p className="text-xs text-blue-400 mt-1">🔧 Assigned to: {t.technicianName}</p>
                  )}
                  {t.resolutionNotes && (
                    <p className="text-xs text-emerald-400 mt-1">✅ {t.resolutionNotes}</p>
                  )}
                  {t.rejectionReason && (
                    <p className="text-xs text-red-400 mt-1">❌ {t.rejectionReason}</p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {t.attachments?.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {t.attachments.map(a => (
                    <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 group relative rounded-lg overflow-hidden border border-neutral-700 block w-20 h-20">
                      <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              )}

              {/* Comments count */}
              {(t.comments?.length > 0) && (
                <div className="mt-3 pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-500">💬 {t.comments.length} comment{t.comments.length > 1 ? 's' : ''}</p>
                  <div className="mt-2 space-y-1">
                    {t.comments.slice(-2).map((c, i) => (
                      <div key={c.id || i} className="bg-neutral-900 rounded-lg px-3 py-2">
                        <p className="text-xs text-neutral-400">{c.commentedBy} <span className="text-neutral-600">({c.commentedByRole})</span></p>
                        <p className="text-xs text-neutral-300">{c.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ReportModal
            facilities={facilities}
            user={user}
            onClose={() => setModalOpen(false)}
            onCreated={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
