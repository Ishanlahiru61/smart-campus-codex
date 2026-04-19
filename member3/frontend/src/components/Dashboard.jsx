import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp, FiUser, FiX } from 'react-icons/fi';
import { incidentsAPI } from '../services/api';
import './Dashboard.css';

function Dashboard({ tickets, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [tickets]);

  const fetchStatistics = async () => {
    try {
      const response = await incidentsAPI.getStatistics();
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
      title: 'Total Tickets',
      value: stats?.totalTickets || 0,
      icon: FiAlertCircle,
      color: 'blue',
      trend: '+5%',
    },
    {
      id: 2,
      title: 'Open',
      value: stats?.openTickets || 0,
      icon: FiAlertCircle,
      color: 'danger',
      trend: 'Active',
    },
    {
      id: 3,
      title: 'In Progress',
      value: stats?.inProgressTickets || 0,
      icon: FiClock,
      color: 'warning',
      trend: 'Processing',
    },
    {
      id: 4,
      title: 'Resolved',
      value: stats?.resolvedTickets || 0,
      icon: FiCheckCircle,
      color: 'success',
      trend: 'Completed',
    },
    {
      id: 5,
      title: 'Unassigned',
      value: stats?.unassignedTickets || 0,
      icon: FiUser,
      color: 'warning',
      trend: 'Need Assign',
    },
    {
      id: 6,
      title: 'Avg Resolution',
      value: stats?.averageResolutionTime || 0,
      icon: FiTrendingUp,
      color: 'info',
      trend: 'hours',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
      y: -8,
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
          <h1 className="dashboard-title">Incident Management Dashboard</h1>
          <p className="dashboard-subtitle">
            Track and manage all maintenance and incident tickets
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
              className={`stat-card stat-card-${card.color}`}
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="stat-header">
                <div className="stat-icon">
                  <Icon />
                </div>
                <div className="stat-label">{card.title}</div>
              </div>

              <div className="stat-content">
                <div className="stat-value">{card.value}</div>
                <div className="stat-trend">{card.trend}</div>
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
          <span>View All Tickets</span>
          <span className="arrow">→</span>
        </motion.button>
        <motion.button
          className="action-btn secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('form')}
        >
          <span>Create New Ticket</span>
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
          <h3>Ticket Workflow</h3>
          <div className="workflow-steps">
            <div className="step">
              <span className="step-icon">1</span>
              <span className="step-label">OPEN</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <span className="step-icon">2</span>
              <span className="step-label">IN PROGRESS</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <span className="step-icon">3</span>
              <span className="step-label">RESOLVED</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <span className="step-icon">4</span>
              <span className="step-label">CLOSED</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Quick Features</h3>
          <ul>
            <li>📋 Create detailed incident tickets</li>
            <li>🖼️ Attach up to 3 evidence images</li>
            <li>💬 Add comments with role-based editing</li>
            <li>👨‍🔧 Assign technicians to tickets</li>
            <li>📊 Track resolution times</li>
            <li>🔄 Real-time status updates</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Priority Levels</h3>
          <div className="priority-list">
            <div className="priority-item">
              <span className="priority-badge critical">CRITICAL</span>
              <span>Urgent issues</span>
            </div>
            <div className="priority-item">
              <span className="priority-badge high">HIGH</span>
              <span>Important incidents</span>
            </div>
            <div className="priority-item">
              <span className="priority-badge medium">MEDIUM</span>
              <span>Regular issues</span>
            </div>
            <div className="priority-item">
              <span className="priority-badge low">LOW</span>
              <span>Minor issues</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
