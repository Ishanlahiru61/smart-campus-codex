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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminAPI.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      setUsers(users.map(u => u.id === userId ? { ...u, enabled: !currentStatus } : u));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, [`ROLE_${newRole}`]);
      toast.success('User role updated successfully');
      setUsers(users.map(u => u.id === userId ? { ...u, roles: [`ROLE_${newRole}`] } : u));
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'TECHNICIAN': return <Wrench className="w-4 h-4 text-orange-400" />;
      default: return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            User Management
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Manage platform users, roles, and access</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search by email or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="text-sm text-neutral-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900/50 text-neutral-400 border-b border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={user.id} 
                    className="hover:bg-neutral-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.username || 'N/A'}</div>
                          <div className="text-xs text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.roles[0]?.replace('ROLE_', '') || 'USER'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="USER">User</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {user.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.enabled)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          user.enabled 
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {user.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-neutral-500">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New User</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-neutral-500 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••" minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="USER">User</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex justify-center items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
