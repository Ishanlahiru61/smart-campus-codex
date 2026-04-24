import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Search, X, Loader2, Calendar, ChevronRight } from 'lucide-react';
import { facilityAPI } from '../../services/facilityApi';
import { userBookingAPI } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const FACILITY_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPORTS', 'LIBRARY', 'CAFETERIA', 'OTHER'];

function BookingModal({ facility, onClose, onBooked }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ startTime: '', endTime: '', purpose: '', attendees: 1 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) { toast.warning('Please select start and end times'); return; }
    if (new Date(form.endTime) <= new Date(form.startTime)) { toast.warning('End time must be after start time'); return; }
    setSaving(true);
    try {
      await userBookingAPI.create({
        resourceId: facility.id,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        attendees: parseInt(form.attendees),
      });
      toast.success('Booking request submitted! Awaiting approval.');
      onBooked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-neutral-500";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Book Facility</h3>
            <p className="text-sm text-blue-400">{facility.name}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-neutral-800 rounded-xl p-3 mb-4 text-xs text-neutral-400 space-y-1">
          <p>📍 {facility.location}</p>
          <p>👥 Capacity: {facility.capacity}</p>
          {facility.costPerHour && <p>💰 LKR {facility.costPerHour}/hr</p>}
          {facility.requiresApproval && <p className="text-amber-400">⚠ This facility requires admin approval</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Start Date & Time *</label>
            <input required type="datetime-local" className={inp} value={form.startTime}
              min={new Date().toISOString().slice(0, 16)}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">End Date & Time *</label>
            <input required type="datetime-local" className={inp} value={form.endTime}
              min={form.startTime || new Date().toISOString().slice(0, 16)}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Purpose *</label>
            <input required minLength={5} className={inp} value={form.purpose}
              onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Project meeting" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Number of Attendees *</label>
            <input required type="number" min={1} max={facility.capacity} className={inp} value={form.attendees}
              onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />} Book Now
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function UserFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [booking, setBooking]       = useState(null);

  const fetch = async () => {
    try {
      setIsLoading(true);
      const res = await facilityAPI.getAll();
      setFacilities((res.data || []).filter(f => f.status === 'ACTIVE'));
    } catch { toast.error('Failed to load facilities'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = facilities.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !search || f.name?.toLowerCase().includes(q) || f.location?.toLowerCase().includes(q);
    const matchType   = !filterType || f.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-emerald-400" /> Browse Facilities
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Find and book available campus facilities</p>
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search by name or location..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-full sm:w-44">
          <option value="">All Types</option>
          {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <p className="text-sm text-neutral-500 shrink-0">{filtered.length} facilities</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Building className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No active facilities found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(f => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-800 border border-neutral-700 hover:border-blue-500/30 rounded-xl overflow-hidden flex flex-col transition-colors group">
              
              <div className="h-40 bg-neutral-900 relative">
                {f.imageUrl ? (
                  <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <Building className="w-12 h-12 text-neutral-500" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="text-xs bg-neutral-900/80 backdrop-blur text-neutral-300 px-2 py-1 rounded-full border border-neutral-700">{(f.type || '').replace('_', ' ')}</span>
                  {f.requiresApproval && <span className="text-xs bg-amber-500/20 backdrop-blur text-amber-400 px-2 py-1 rounded-full border border-amber-500/30">Approval needed</span>}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors mb-1">{f.name}</h3>
                <p className="text-xs text-neutral-500 mb-2">📍 {f.location}</p>
                {f.description && <p className="text-xs text-neutral-400 mb-3 line-clamp-2">{f.description}</p>}

                <div className="flex flex-wrap gap-1 mb-3">
                  {(f.amenities || []).slice(0, 3).map(a => (
                    <span key={a} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                  {(f.amenities || []).length > 3 && <span className="text-xs text-neutral-600">+{f.amenities.length - 3} more</span>}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-700/50">
                  <div className="text-xs text-neutral-400">
                    <span className="text-white font-medium">Cap: {f.capacity}</span>
                    {f.costPerHour ? <span className="ml-2 text-blue-400">LKR {f.costPerHour}/hr</span> : <span className="ml-2 text-emerald-400">Free</span>}
                  </div>
                  <button onClick={() => setBooking(f)}
                    className="flex items-center gap-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Calendar className="w-3.5 h-3.5" /> Book
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {booking && <BookingModal facility={booking} onClose={() => setBooking(null)} onBooked={fetch} />}
      </AnimatePresence>
    </div>
  );
}
