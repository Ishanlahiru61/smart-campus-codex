import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import './FacilitiesList.css';

function FacilitiesList({
  facilities,
  loading,
  error,
  searchQuery,
  filterType,
  filterStatus,
  onSearch,
  onFilter,
  onViewDetails,
  onEdit,
  onDelete,
  onCreateNew,
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const facilityTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
  const facilityStatus = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="facilities-list">
      <motion.div
        className="list-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>Facilities Catalogue</h1>
          <p>Browse and manage all campus facilities</p>
        </div>
        <motion.button
          className="btn-create"
          onClick={onCreateNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> Add Facility
        </motion.button>
      </motion.div>

      {error && (
        <motion.div
          className="error-message"
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
              placeholder="Search facilities by name..."
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
              <label>Type</label>
              <select
                value={filterType}
                onChange={(e) => onFilter(e.target.value, filterStatus)}
              >
                <option value="">All Types</option>
                {facilityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => onFilter(filterType, e.target.value)}
              >
                <option value="">All Status</option>
                {facilityStatus.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
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
        <div className="loading">Loading facilities...</div>
      ) : facilities.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">🏢</div>
          <h2>No Facilities Found</h2>
          <p>Start by adding a new facility to your catalogue</p>
          <motion.button
            className="btn-create"
            onClick={onCreateNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus /> Create First Facility
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="facilities-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {facilities.map((facility) => (
              <motion.div
                key={facility.id}
                className={`facility-card status-${facility.status?.toLowerCase()}`}
                variants={itemVariants}
                exit="exit"
                layoutId={facility.id}
              >
                <div className="facility-header">
                  <div className="facility-type-badge">{facility.type}</div>
                  <div className={`facility-status ${facility.status?.toLowerCase()}`}>
                    {facility.status}
                  </div>
                </div>

                <div className="facility-image-placeholder">
                  {facility.imageUrl ? (
                    <img src={facility.imageUrl} alt={facility.name} />
                  ) : (
                    <div className="image-placeholder">
                      <span>{facility.type.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div className="facility-body">
                  <h3 className="facility-name">{facility.name}</h3>
                  <p className="facility-location">📍 {facility.location}</p>

                  <div className="facility-meta">
                    <div className="meta-item">
                      <span className="meta-label">Capacity</span>
                      <span className="meta-value">{facility.capacity} people</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Building</span>
                      <span className="meta-value">{facility.buildingCode || 'N/A'}</span>
                    </div>
                  </div>

                  {facility.amenities && facility.amenities.length > 0 && (
                    <div className="amenities">
                      {facility.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                      {facility.amenities.length > 3 && (
                        <span className="amenity-tag more">
                          +{facility.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="facility-footer">
                  <motion.button
                    className="action-btn view"
                    onClick={() => onViewDetails(facility)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="View Details"
                  >
                    <FiEye />
                  </motion.button>
                  <motion.button
                    className="action-btn edit"
                    onClick={() => onEdit(facility)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </motion.button>
                  <motion.button
                    className="action-btn delete"
                    onClick={() => onDelete(facility.id)}
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

export default FacilitiesList;
