import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import analyticsApi from '../../services/analyticsApi';

export default function AdminDashboard() {
  const [topResources, setTopResources] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [resources, hours, trends] = await Promise.all([
          analyticsApi.getTopResources(),
          analyticsApi.getPeakHours(),
          analyticsApi.getBookingTrends()
        ]);
        setTopResources(resources);
        setPeakHours(hours);
        setBookingTrends(trends);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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

      {/* Analytics Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Usage Analytics</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Resources Chart */}
            <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Top Booked Facilities</h3>
              {topResources.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topResources} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="facilityName" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="totalBookings" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400">No data available</div>
              )}
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Peak Booking Hours</h3>
              {peakHours.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={peakHours} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="hour" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                      <Line type="monotone" dataKey="bookingCount" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400">No data available</div>
              )}
            </div>

            {/* Booking Trends Chart (Full Width) */}
            <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Daily Booking Trends</h3>
              {bookingTrends.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bookingTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                      <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-slate-400">No data available</div>
              )}
            </div>

          </div>
        )}
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
