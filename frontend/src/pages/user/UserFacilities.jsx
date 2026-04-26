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
  const [form, setForm] = useState({ bookingDate: '', startTime: '', endTime: '', purpose: '', attendees: 20 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingDate || !form.startTime || !form.endTime) { toast.warning('Please select booking date, start time and end time'); return; }

    const startDateTime = `${form.bookingDate}T${form.startTime}`;
    const endDateTime = `${form.bookingDate}T${form.endTime}`;

    if (new Date(endDateTime) <= new Date(startDateTime)) { toast.warning('End time must be after start time'); return; }
    setSaving(true);
    try {
      await userBookingAPI.create({
        resourceId: facility.id,
        startTime: startDateTime,
        endTime: endDateTime,
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

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition-all";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Book Facility</h3>
            <p className="text-sm font-semibold text-blue-600 mt-0.5">{facility.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-1.5">
          <p className="text-sm font-medium text-slate-600">📍 {facility.location}</p>
          <p className="text-sm font-medium text-slate-600">👥 Capacity: {facility.capacity}</p>
          {facility.costPerHour && <p className="text-sm font-medium text-slate-600">💰 LKR {facility.costPerHour}/hr</p>}
          {facility.requiresApproval && <p className="text-sm font-semibold text-amber-600">⚠ This facility requires admin approval</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Booking Date *</label>
            <input required type="date" className={inp} value={form.bookingDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Time *</label>
              <input required type="time" step="1800" className={inp} value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Time *</label>
              <input required type="time" step="1800" className={inp} value={form.endTime}
                min={form.startTime || undefined}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Purpose *</label>
            <input required minLength={5} className={inp} value={form.purpose}
              onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. OOP Lecture" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Number of Attendees *</label>
            <input required type="number" min={1} max={facility.capacity} className={inp} value={form.attendees}
              onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50">
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Building className="w-7 h-7 text-emerald-500" /> Browse Facilities
        </h1>
        <p className="text-slate-500 font-medium mt-2">Find and book available campus facilities</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center justify-end">
        <div className="relative flex-1 w-full max-w-md mr-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 font-medium transition-all"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm text-slate-700 font-bold outline-none w-full sm:w-56">
          <option value="">All Facility Types</option>
          {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <p className="text-sm font-semibold text-slate-400 shrink-0">{filtered.length} found</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] text-slate-400 border border-dashed border-slate-200">
          <Building className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="text-xl font-extrabold text-slate-800">No facilities found</p>
          <p className="text-sm font-medium opacity-60 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(f => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 rounded-[24px] overflow-hidden flex flex-col transition-all duration-300 group border-0">
              
              <div className="h-48 bg-slate-100 relative">
                {f.imageUrl ? (
                  <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-xs font-bold bg-white text-slate-700 px-3 py-1.5 rounded-full shadow-sm">{(f.type || '').replace('_', ' ')}</span>
                  {f.requiresApproval && <span className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-sm">Approval needed</span>}
                </div>
              </div>

                <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{f.name}</h3>
                </div>
                <p className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-1.5">📍 {f.location}</p>
                {f.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{f.description}</p>}

                <div className="flex flex-wrap gap-2 mb-4">
                  {(f.amenities || []).slice(0, 3).map(a => (
                    <span key={a} className="text-xs font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md">{a}</span>
                  ))}
                  {(f.amenities || []).length > 3 && <span className="text-xs font-semibold text-slate-400 self-center">+{f.amenities.length - 3} more</span>}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Capacity</span>
                    <span className="text-sm font-bold text-slate-800">{f.capacity} People</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost</span>
                    {f.costPerHour ? <span className="text-sm font-bold text-blue-600">LKR {f.costPerHour}/hr</span> : <span className="text-sm font-bold text-emerald-500">Free</span>}
                  </div>
                </div>
                
                <button onClick={() => setBooking(f)}
                  className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-bold bg-slate-900 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-all shadow-md">
                  <Calendar className="w-4 h-4" /> Book Facility
                </button>
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