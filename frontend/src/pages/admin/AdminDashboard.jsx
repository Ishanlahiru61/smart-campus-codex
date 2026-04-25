import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Overview</h1>
        <p className="text-slate-500 font-medium mt-2">System status and quick actions</p>
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

const DashboardCard = ({ icon, title, description, link, color }) => {
  // Translate the base color to soft bg and solid text
  const textColor = color.replace('bg-', 'text-');
  const bgColor = color.replace('500', '50');

  return (
    <Link to={link}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] p-8 rounded-[24px] cursor-pointer transition-all duration-300 h-full border-0 group"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 ${bgColor} group-hover:${color} group-hover:text-white`}>
          <div className={`transition-colors duration-300 ${textColor} group-hover:text-white`}>
            {React.cloneElement(icon, { className: 'w-7 h-7' })}
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm font-medium text-slate-500">{description}</p>
      </motion.div>
    </Link>
  );
};
