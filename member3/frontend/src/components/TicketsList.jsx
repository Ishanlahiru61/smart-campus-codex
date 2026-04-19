import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiRefreshCw } from 'react-icons/fi';
import './TicketsList.css';

function TicketsList({
  tickets,
  loading,
  error,
  searchQuery,
  filterStatus,
  filterPriority,
  onSearch,
  onFilter,
  onViewDetails,
  onEdit,
  onDelete,
  onCreateNew,
  onRefresh,
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'RESOLVED':
        return 'status-resolved';
      case 'CLOSED':
        return 'status-closed';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'priority-critical';
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="tickets-list">
      <motion.div
        className="list-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>Incident Tickets</h1>
          <p>Manage and track all maintenance and incident tickets</p>
        </div>
        <div className="header-actions">
          <motion.button
            className="btn-refresh"
            onClick={onRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Refresh"
          >
            <FiRefreshCw />
          </motion.button>
          <motion.button
            className="btn-create"
            onClick={onCreateNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus /> New Ticket
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="error-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.div>
      )}

      <motion.div
        className="search-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search tickets by title or number..."
              value={localSearch}
              onChange={handleSearchChange}
              className="search-input"
            />
            {localSearch && (
              <button
                type="button"
                className="clear-btn"
                onClick={handleClearSearch}
              >
                <FiX />
              </button>
            )}
          </div>
          <motion.button
            type="submit"
            className="search-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        </form>

        <motion.button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiFilter />
          Filters
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filter-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => onFilter(e.target.value, filterPriority)}
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => onFilter(filterStatus, e.target.value)}
              >
                <option value="">All Priority</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              className="filter-reset"
              onClick={() => {
                onFilter('', '');
                setShowFilters(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset Filters
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading tickets...
        </div>
      ) : tickets.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">📋</div>
          <h2>No Tickets Found</h2>
          <p>Start by creating a new incident ticket</p>
          <motion.button
            className="btn-create"
            onClick={onCreateNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus /> Create First Ticket
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="tickets-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                className="ticket-card"
                variants={itemVariants}
                exit="exit"
                layoutId={ticket.id}
              >
                <div className="ticket-header">
                  <div className="ticket-number">{ticket.ticketNumber}</div>
                  <div className={`ticket-status ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </div>
                </div>

                <div className="ticket-body">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-category">Category: {ticket.category}</p>
                  <p className="ticket-facility">📍 {ticket.facilityName}</p>

                  <div className="ticket-meta">
                    <div className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </div>
                    {ticket.assignedTechnician && (
                      <div className="tech-badge">👨‍🔧 {ticket.technicianName}</div>
                    )}
                  </div>

                  <div className="ticket-stats">
                    <div className="stat">
                      <span className="label">Comments</span>
                      <span className="value">{ticket.totalComments || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Attachments</span>
                      <span className="value">{ticket.totalAttachments || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <motion.button
                    className="action-btn view"
                    onClick={() => onViewDetails(ticket)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="View Details"
                  >
                    <FiEye />
                  </motion.button>
                  <motion.button
                    className="action-btn edit"
                    onClick={() => onEdit(ticket)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </motion.button>
                  <motion.button
                    className="action-btn delete"
                    onClick={() => onDelete(ticket.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default TicketsList;
