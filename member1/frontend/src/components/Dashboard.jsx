import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { facilitiesAPI } from '../services/api';
import './Dashboard.css';

function Dashboard({ facilities, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await facilitiesAPI.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      id: 1,
      title: 'Total Facilities',
      value: stats?.totalFacilities || 0,
      icon: FiBarChart2,
      gradient: 'gradient-blue',
      color: '#667eea',
    },
    {
      id: 2,
      title: 'Active',
      value: stats?.activeFacilities || 0,
      icon: FiCheckCircle,
      gradient: 'gradient-green',
      color: '#38ef7d',
    },
    {
      id: 3,
      title: 'Under Maintenance',
      value: stats?.maintenanceFacilities || 0,
      icon: FiTrendingUp,
      gradient: 'gradient-yellow',
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Out of Service',
      value: stats?.outOfServiceFacilities || 0,
      icon: FiAlertCircle,
      gradient: 'gradient-red',
      color: '#f5576c',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="dashboard-title">Campus Facilities Management</h1>
          <p className="dashboard-subtitle">
            Manage and monitor all campus facilities and resources
          </p>
        </div>
      </motion.div>

      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              className={`stat-card ${card.gradient}`}
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="stat-card-header">
                <div className="stat-icon">
                  <Icon />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{card.title}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              </div>
              <div className="stat-footer">
                <span className="stat-trend">↑ Updated now</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className="dashboard-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.button
          className="action-btn primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('list')}
        >
          <span>View All Facilities</span>
          <span className="arrow">→</span>
        </motion.button>
        <motion.button
          className="action-btn secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('form')}
        >
          <span>Add New Facility</span>
          <span className="plus">+</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="dashboard-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="info-card">
          <h3>Quick Start</h3>
          <ul>
            <li>📋 Browse all available facilities and resources</li>
            <li>✅ Filter by type, location, and availability status</li>
            <li>📝 Create new facility entries with detailed information</li>
            <li>✏️ Update and manage existing facility information</li>
            <li>🗑️ Archive or remove facilities as needed</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Facility Types</h3>
          <ul>
            <li>🎓 Lecture Halls - Large capacity auditoriums</li>
            <li>🧪 Laboratories - Equipment-equipped research spaces</li>
            <li>👥 Meeting Rooms - Small group discussion areas</li>
            <li>🔧 Equipment - Individual resources and devices</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
