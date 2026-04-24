import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Plus, Search, Edit, Trash2, Loader2, X, CheckCircle, AlertTriangle, Wrench, ChevronDown } from 'lucide-react';
import { facilityAPI } from '../../services/facilityApi';
import { toast } from 'react-toastify';

const FACILITY_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPORTS', 'LIBRARY', 'CAFETERIA', 'OTHER'];
const STATUS_OPTIONS = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  OUT_OF_SERVICE: 'bg-red-500/10 text-red-400 border-red-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const STATUS_ICONS = {
  ACTIVE: <CheckCircle className="w-3.5 h-3.5" />,
  OUT_OF_SERVICE: <X className="w-3.5 h-3.5" />,
  MAINTENANCE: <Wrench className="w-3.5 h-3.5" />,
};

function ConfirmDeleteModal({ facilityName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Delete Facility</h3>
            <p className="text-neutral-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mb-6">
          Are you sure you want to delete <strong className="text-white">{facilityName}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const EMPTY_FORM = {
  name: '', type: 'LECTURE_HALL', capacity: '', location: '',
  description: '', status: 'ACTIVE', amenities: '',
  floorNumber: '', buildingCode: '', contactPerson: '',
  contactEmail: '', contactPhone: '', costPerHour: '',
  requiresApproval: false,
  availabilityWindows: [],
};

function FacilityModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY_FORM,
        ...initial,
        amenities: (initial.amenities || []).join(', '),
        capacity: initial.capacity ?? '',
        floorNumber: initial.floorNumber ?? '',
        costPerHour: initial.costPerHour ?? '',
        requiresApproval: initial.requiresApproval ?? false,
        availabilityWindows: initial.availabilityWindows || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setImageFile(null);
    setPreview(initial?.imageUrl || null);
  }, [initial, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addWindow = () =>
    setForm(f => ({ ...f, availabilityWindows: [...f.availabilityWindows, { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' }] }));

  const removeWindow = (i) =>
    setForm(f => ({ ...f, availabilityWindows: f.availabilityWindows.filter((_, idx) => idx !== i) }));

  const updateWindow = (i, key, val) =>
    setForm(f => ({
      ...f,
      availabilityWindows: f.availabilityWindows.map((w, idx) => idx === i ? { ...w, [key]: val } : w),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const facilityData = {
        ...form,
        capacity: parseInt(form.capacity) || 1,
        floorNumber: form.floorNumber !== '' ? parseInt(form.floorNumber) : null,
        costPerHour: form.costPerHour !== '' ? parseFloat(form.costPerHour) : null,
        amenities: typeof form.amenities === 'string' ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        requiresApproval: form.requiresApproval,
        availabilityWindows: form.availabilityWindows,
      };
      
      const formData = new FormData();
      formData.append('facility', JSON.stringify(facilityData));
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      await onSave(formData);
      onClose();
    } catch (err) {
      const errData = err.response?.data;
      const msg = typeof errData === 'string'
        ? errData
        : errData?.message || errData?.error || 'Failed to save facility';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inputCls = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-neutral-500";
  const labelCls = "block text-xs font-medium text-neutral-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl shadow-2xl my-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Facility' : 'Create New Facility'}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Facility Name *</label>
              <input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Lab A-201" />
            </div>
            <div>
              <label className={labelCls}>Type *</label>
              <select required className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
                {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Capacity & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Capacity *</label>
              <input required type="number" min="1" className={inputCls} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 50" />
            </div>
            <div>
              <label className={labelCls}>Status *</label>
              <select required className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelCls}>Facility Image</label>
            <div className="flex items-center gap-4">
              {preview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer focus:outline-none" />
            </div>
          </div>

          {/* Row 3: Location */}
          <div>
            <label className={labelCls}>Location *</label>
            <input required className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Block B, Floor 2" />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={2} className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the facility..." />
          </div>

          {/* Row 4: Building & Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Building Code</label>
              <input className={inputCls} value={form.buildingCode} onChange={e => set('buildingCode', e.target.value)} placeholder="e.g. B01" />
            </div>
            <div>
              <label className={labelCls}>Floor Number</label>
              <input type="number" className={inputCls} value={form.floorNumber} onChange={e => set('floorNumber', e.target.value)} placeholder="e.g. 2" />
            </div>
          </div>

          {/* Row 5: Cost & Approval */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Cost Per Hour (LKR)</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.costPerHour} onChange={e => set('costPerHour', e.target.value)} placeholder="e.g. 500.00" />
            </div>
            <div className="flex items-center mt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => set('requiresApproval', !form.requiresApproval)}
                  className={`w-11 h-6 rounded-full transition-colors ${form.requiresApproval ? 'bg-blue-500' : 'bg-neutral-700'} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.requiresApproval ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm text-neutral-300">Requires Approval</span>
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className={labelCls}>Amenities (comma-separated)</label>
            <input className={inputCls} value={form.amenities} onChange={e => set('amenities', e.target.value)} placeholder="e.g. Projector, Whiteboard, AC" />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Contact Person</label>
              <input className={inputCls} value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="Name" />
            </div>
            <div>
              <label className={labelCls}>Contact Email</label>
              <input type="email" className={inputCls} value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="email@campus.lk" />
            </div>
            <div>
              <label className={labelCls}>Contact Phone <span className="text-neutral-600">(10+ digits)</span></label>
              <input
                className={inputCls}
                value={form.contactPhone}
                onChange={e => set('contactPhone', e.target.value.replace(/[^0-9+]/g, ''))}
                placeholder="0771234567"
                maxLength={15}
              />
            </div>
          </div>

          {/* Availability Windows */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={labelCls}>Availability Windows</label>
              <button type="button" onClick={addWindow} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Window
              </button>
            </div>
            <div className="space-y-2">
              {form.availabilityWindows.map((w, i) => (
                <div key={i} className="flex gap-2 items-center bg-neutral-800 rounded-lg p-2 border border-neutral-700">
                  <select className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none" value={w.dayOfWeek} onChange={e => updateWindow(i, 'dayOfWeek', e.target.value)}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="time" className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none" value={w.startTime} onChange={e => updateWindow(i, 'startTime', e.target.value)} />
                  <span className="text-neutral-500 text-xs">to</span>
                  <input type="time" className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none" value={w.endTime} onChange={e => updateWindow(i, 'endTime', e.target.value)} />
                  <button type="button" onClick={() => removeWindow(i)} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.availabilityWindows.length === 0 && (
                <p className="text-xs text-neutral-600 italic">No availability windows set — facility is available anytime.</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-700 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {isEdit ? 'Save Changes' : 'Create Facility'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
  const [stats, setStats] = useState(null);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const res = await facilityAPI.getAll();
      setFacilities(res.data || []);
    } catch {
      toast.error('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await facilityAPI.getStatistics();
      setStats(res.data);
    } catch { /* stats are optional */ }
  };

  useEffect(() => {
    fetchFacilities();
    fetchStats();
  }, []);

  const handleCreate = async (payload) => {
    await facilityAPI.create(payload);
    toast.success('Facility created successfully!');
    fetchFacilities();
    fetchStats();
  };

  const handleUpdate = async (payload) => {
    await facilityAPI.update(editing.id, payload);
    toast.success('Facility updated successfully!');
    fetchFacilities();
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await facilityAPI.delete(id);
      toast.success('Facility deleted');
      setFacilities(prev => prev.filter(f => f.id !== id));
      fetchStats();
    } catch {
      toast.error('Failed to delete facility');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await facilityAPI.updateStatus(id, newStatus);
      toast.success('Status updated');
      setFacilities(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = facilities.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || f.type === filterType;
    const matchStatus = !filterStatus || f.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (f) => { setEditing(f); setModalOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-400" />
            Facility Management
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Create, edit, and manage campus facilities</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Facility
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.totalFacilities ?? facilities.length, color: 'text-blue-400' },
            { label: 'Active', value: stats.activeFacilities ?? facilities.filter(f => f.status === 'ACTIVE').length, color: 'text-emerald-400' },
            { label: 'Maintenance', value: stats.maintenanceFacilities ?? facilities.filter(f => f.status === 'MAINTENANCE').length, color: 'text-amber-400' },
            { label: 'Out of Service', value: stats.outOfServiceFacilities ?? facilities.filter(f => f.status === 'OUT_OF_SERVICE').length, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3">
              <p className="text-neutral-500 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-44"
        >
          <option value="">All Types</option>
          {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <p className="text-sm text-neutral-500 shrink-0">{filtered.length} of {facilities.length}</p>
      </div>

      {/* Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Building className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No facilities found.</p>
            <button onClick={openCreate} className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline">Create the first one</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-900/50 text-neutral-400 border-b border-neutral-700">
                <tr>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Capacity</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Cost/hr</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filtered.map(f => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-700/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{f.name}</div>
                      <div className="text-xs text-neutral-500">{f.location}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-neutral-700 text-neutral-300 px-2 py-1 rounded-full">
                        {(f.type || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-300">{f.capacity}</td>
                    <td className="px-5 py-3">
                      <div className="relative group inline-block">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer ${STATUS_STYLES[f.status] || ''}`}>
                          {STATUS_ICONS[f.status]}
                          {(f.status || '').replace('_', ' ')}
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </span>
                        <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-10 py-1 min-w-[150px]">
                          {STATUS_OPTIONS.filter(s => s !== f.status).map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(f.id, s)}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-700 transition-colors ${STATUS_STYLES[s]} border-0 bg-transparent`}
                            >
                              {s.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-300">
                      {f.costPerHour != null ? `LKR ${f.costPerHour}` : <span className="text-neutral-600">Free</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: f.id, name: f.name })}
                          disabled={deletingId === f.id}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <FacilityModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={editing ? handleUpdate : handleCreate}
            initial={editing}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDeleteModal
            facilityName={confirmDelete.name}
            onConfirm={() => handleDelete(confirmDelete.id)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
