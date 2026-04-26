import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Shield, User, Wrench, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { adminAPI } from '../../services/adminApi';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'USER' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getAllUsers();
      if (response.success) setUsers(response.data);
    } catch { toast.error('Failed to load users'); }
    finally { setIsLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminAPI.createUser({ username: formData.username, email: formData.email, password: formData.password, role: formData.role });
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to create user');
    } finally { setIsSubmitting(false); }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      setUsers(users.map(u => u.id === userId ? { ...u, enabled: !currentStatus } : u));
    } catch { toast.error('Failed to update status'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, [`ROLE_${newRole}`]);
      toast.success('User role updated successfully');
      setUsers(users.map(u => u.id === userId ? { ...u, roles: [`ROLE_${newRole}`] } : u));
    } catch { toast.error('Failed to update role'); }
  };

  const getRoleMeta = (role) => {
    switch (role) {
      case 'ADMIN': return { label: 'Admin', style: 'bg-purple-50 text-purple-700', icon: <Shield className="w-3.5 h-3.5" /> };
      case 'TECHNICIAN': return { label: 'Technician', style: 'bg-orange-50 text-orange-700', icon: <Wrench className="w-3.5 h-3.5" /> };
      default: return { label: 'User', style: 'bg-blue-50 text-blue-700', icon: <User className="w-3.5 h-3.5" /> };
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition-all";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" /> User Management
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage platform users, roles, and access</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all font-bold text-sm shadow-md shadow-blue-500/20">
          <UserPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'text-slate-800' },
          { label: 'Active', value: users.filter(u => u.enabled).length, icon: '✅', color: 'text-emerald-700' },
          { label: 'Disabled', value: users.filter(u => !u.enabled).length, icon: '🚫', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6">
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search by email or username..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
          />
        </div>
        <p className="text-sm font-semibold text-slate-400 shrink-0">
          {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const currentRole = user.roles[0]?.replace('ROLE_', '') || 'USER';
                  const roleMeta = getRoleMeta(currentRole);
                  return (
                    <motion.tr
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{user.username || 'N/A'}</div>
                            <div className="text-xs font-medium text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="USER">User</option>
                          <option value="TECHNICIAN">Technician</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          user.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {user.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.enabled)}
                          className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${
                            user.enabled
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {user.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center text-slate-400 font-medium">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-8 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Create New User</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className={inp} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={inp} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={inp} placeholder="••••••••" minLength={6} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={inp}>
                  <option value="USER">User</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
