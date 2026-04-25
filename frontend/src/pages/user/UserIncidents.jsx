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
    if (files.length + selected.length > 3) { toast.warning('Maximum 3 images allowed'); return; }
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
        facilityId: form.facilityId, facilityName: form.facilityName,
        category: form.category, title: form.title, description: form.description,
        priority: form.priority, reportedBy: form.reportedBy,
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
    } finally { setSaving(false); }
  };

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 transition-all";
  const lbl = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] w-full max-w-lg my-4">

        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Report Incident
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={lbl}>Facility *</label>
            <select required className={inp} value={form.facilityId} onChange={e => handleFacilityChange(e.target.value)}>
              <option value="">— Select Facility —</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.location})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className={lbl}>Title *</label>
            <input required minLength={5} maxLength={100} className={inp} value={form.title}
              onChange={e => set('title', e.target.value)} placeholder="Brief title of the incident" />
          </div>

          <div>
            <label className={lbl}>Description *</label>
            <textarea required minLength={10} maxLength={1000} rows={3} className={inp} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Describe the issue in detail..." />
          </div>

          <div>
            <label className={lbl}>Images (Max 3)</label>
            <input type="file" accept="image/png, image/jpeg" multiple onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer focus:outline-none mb-3" />
            {previews.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0">
                    <img src={src} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50">
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
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [iRes, fRes] = await Promise.allSettled([
        incidentAPI.getMyTickets(),
        facilityAPI.getAll(),
      ]);
      if (iRes.status === 'fulfilled') setTickets(iRes.value?.data || []);
      if (fRes.status === 'fulfilled') setFacilities((fRes.value?.data || []).filter(f => f.status === 'ACTIVE'));
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const filtered = tickets.filter(t => !filterStatus || t.status === filterStatus);
  const counts = tickets.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});
  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-LK', { dateStyle: 'medium' }) : '—';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-500" /> My Incidents
          </h1>
          <p className="text-slate-500 font-medium mt-2">Report and track campus facility issues</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all font-bold text-sm shrink-0 shadow-md shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { label: 'Total', value: tickets.length, icon: '📋', color: 'text-slate-800' },
          { label: 'Open / Active', value: (counts.OPEN || 0) + (counts.IN_PROGRESS || 0), icon: '🔥', color: 'text-amber-700' },
          { label: 'Resolved', value: (counts.RESOLVED || 0) + (counts.CLOSED || 0), icon: '✅', color: 'text-emerald-700' },
          { label: 'Rejected', value: counts.REJECTED || 0, icon: '❌', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6">
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              filterStatus === s
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-500 hover:text-slate-800 shadow-[0_4px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)]'
            }`}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Tickets */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold mb-3">No incident reports found.</p>
          <button onClick={() => setModalOpen(true)} className="text-amber-600 hover:text-amber-700 text-sm font-bold underline">
            Report your first issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] rounded-[24px] px-8 py-6 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLE[t.status]}`}>
                      {(t.status || '').replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${PRIORITY_STYLE[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">{t.ticketNumber}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 mb-1">{t.title}</p>
                  <p className="text-sm font-medium text-slate-400">
                    📍 {t.facilityName} · 🏷 {t.category} · 📅 {fmt(t.createdAt)}
                  </p>
                  {t.technicianName && (
                    <p className="text-sm font-semibold text-blue-600 mt-2">🔧 Assigned to: {t.technicianName}</p>
                  )}
                  {t.resolutionNotes && (
                    <p className="text-sm font-semibold text-emerald-600 mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">✅ {t.resolutionNotes}</p>
                  )}
                  {t.rejectionReason && (
                    <p className="text-sm font-semibold text-red-600 mt-2 bg-red-50 px-3 py-1.5 rounded-lg inline-block">❌ {t.rejectionReason}</p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {t.attachments?.length > 0 && (
                <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
                  {t.attachments.map(a => (
                    <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 group relative rounded-2xl overflow-hidden block w-20 h-20 shadow-sm">
                      <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              )}

              {/* Comments */}
              {(t.comments?.length > 0) && (
                <div className="mt-5 pt-5 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">💬 {t.comments.length} Comment{t.comments.length > 1 ? 's' : ''}</p>
                  <div className="space-y-2">
                    {t.comments.slice(-2).map((c, i) => (
                      <div key={c.id || i} className="bg-slate-50 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-slate-500">{c.commentedBy} <span className="font-normal text-slate-400">({c.commentedByRole})</span></p>
                        <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
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
