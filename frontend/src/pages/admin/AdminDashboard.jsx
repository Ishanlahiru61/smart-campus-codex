import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-neutral-400 text-sm mt-1">System status and quick actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          icon={<Users />} 
          title="User Management" 
          description="Manage users, roles, and access"
          link="/admin/users" 
          color="bg-blue-500" 
        />
        <DashboardCard 
          icon={<Building />} 
          title="Facility Management" 
          description="Manage campus facilities"
          link="/admin/facilities" 
          color="bg-purple-500" 
        />
        <DashboardCard 
          icon={<Calendar />} 
          title="Booking Approvals" 
          description="Review facility bookings"
          link="/admin/bookings" 
          color="bg-emerald-500" 
        />
        <DashboardCard 
          icon={<AlertTriangle />} 
          title="Incident Tickets" 
          description="Assign and track incidents"
          link="/admin/incidents" 
          color="bg-red-500" 
        />
      </div>
    </div>
  );
}

const DashboardCard = ({ icon, title, description, link, color }) => (
  <Link to={link}>
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-neutral-800 border border-neutral-700 hover:border-neutral-500 p-6 rounded-2xl cursor-pointer transition-all h-full"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-20`}>
        <div className={color.replace('bg-', 'text-')}>{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </motion.div>
  </Link>
);
