import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMapPin, FiUsers, FiHome, FiPhone, FiMail } from 'react-icons/fi';
import './FacilityDetails.css';

function FacilityDetails({ facility, onEdit, onDelete, onBack }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'OUT_OF_SERVICE':
        return 'status-inactive';
      case 'MAINTENANCE':
        return 'status-maintenance';
      default:
        return '';
    }
  };

  return (
    <div className="facility-details-page">
      <motion.div
        className="details-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-btn" onClick={onBack}>
          <FiArrowLeft /> Back to List
        </button>
      </motion.div>

      <motion.div
        className="details-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="details-hero" variants={itemVariants}>
          <div className="hero-image">
            {facility.imageUrl ? (
              <img src={facility.imageUrl} alt={facility.name} />
            ) : (
              <div className="image-placeholder">
                <span>{facility.type.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="hero-info">
            <div className="hero-badges">
              <div className="badge type-badge">{facility.type.replace(/_/g, ' ')}</div>
              <div className={`badge status-badge ${getStatusColor(facility.status)}`}>
                {facility.status}
              </div>
            </div>

            <h1 className="details-title">{facility.name}</h1>
            <p className="details-subtitle">{facility.description}</p>

            <div className="quick-info">
              <div className="quick-item">
                <FiMapPin className="icon" />
                <span>{facility.location}</span>
              </div>
              <div className="quick-item">
                <FiUsers className="icon" />
                <span>Capacity: {facility.capacity} people</span>
              </div>
              {facility.costPerHour && (
                <div className="quick-item">
                  <span className="currency">₹{facility.costPerHour}/hour</span>
                </div>
              )}
            </div>

            <div className="hero-actions">
              <motion.button
                className="btn-edit"
                onClick={() => onEdit(facility)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEdit2 /> Edit
              </motion.button>
              <motion.button
                className="btn-delete"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this facility?')) {
                    onDelete(facility.id);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 /> Delete
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <motion.div className="details-grid" variants={itemVariants}>
          {/* Location Information */}
          <div className="details-card">
            <h3>Location Information</h3>
            <div className="detail-row">
              <span className="label">Building Code</span>
              <span className="value">{facility.buildingCode || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Floor Number</span>
              <span className="value">{facility.floorNumber || 'N/A'}</span>
            </div>
            {facility.latitude && facility.longitude && (
              <>
                <div className="detail-row">
                  <span className="label">Latitude</span>
                  <span className="value">{facility.latitude}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Longitude</span>
                  <span className="value">{facility.longitude}</span>
                </div>
              </>
            )}
          </div>

          {/* Capacity & Resources */}
          <div className="details-card">
            <h3>Resources</h3>
            <div className="detail-row">
              <span className="label">Capacity</span>
              <span className="value">{facility.capacity} people</span>
            </div>
            <div className="detail-row">
              <span className="label">Type</span>
              <span className="value">{facility.type.replace(/_/g, ' ')}</span>
            </div>
            {facility.costPerHour && (
              <div className="detail-row">
                <span className="label">Cost per Hour</span>
                <span className="value gradient-text">₹{facility.costPerHour}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">Requires Approval</span>
              <span className="value">
                {facility.requiresApproval ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          {(facility.contactPerson || facility.contactEmail || facility.contactPhone) && (
            <div className="details-card">
              <h3>Contact Information</h3>
              {facility.contactPerson && (
                <div className="detail-row">
                  <span className="label">Contact Person</span>
                  <span className="value">{facility.contactPerson}</span>
                </div>
              )}
              {facility.contactEmail && (
                <div className="detail-row">
                  <span className="label">Email</span>
                  <a href={`mailto:${facility.contactEmail}`} className="value link">
                    <FiMail className="inline-icon" />
                    {facility.contactEmail}
                  </a>
                </div>
              )}
              {facility.contactPhone && (
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <a href={`tel:${facility.contactPhone}`} className="value link">
                    <FiPhone className="inline-icon" />
                    {facility.contactPhone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="details-card">
            <h3>Statistics</h3>
            <div className="detail-row">
              <span className="label">Total Bookings</span>
              <span className="value highlight">{facility.totalBookings || 0}</span>
            </div>
            <div className="detail-row">
              <span className="label">Average Rating</span>
              <span className="value highlight">
                {facility.averageRating ? (
                  <>
                    {facility.averageRating.toFixed(1)} ⭐
                  </>
                ) : (
                  'No ratings yet'
                )}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Amenities */}
        {facility.amenities && facility.amenities.length > 0 && (
          <motion.div className="amenities-section" variants={itemVariants}>
            <h3>Available Amenities</h3>
            <div className="amenities-list-large">
              {facility.amenities.map((amenity, index) => (
                <motion.div
                  key={index}
                  className="amenity-chip"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {amenity}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Audit Information */}
        <motion.div className="audit-section" variants={itemVariants}>
          <h3>Audit Information</h3>
          <div className="audit-grid">
            {facility.createdAt && (
              <div className="audit-item">
                <span className="label">Created</span>
                <span className="value">
                  {new Date(facility.createdAt).toLocaleDateString()} at{' '}
                  {new Date(facility.createdAt).toLocaleTimeString()}
                </span>
                {facility.createdBy && <span className="meta">by {facility.createdBy}</span>}
              </div>
            )}
            {facility.updatedAt && (
              <div className="audit-item">
                <span className="label">Last Updated</span>
                <span className="value">
                  {new Date(facility.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(facility.updatedAt).toLocaleTimeString()}
                </span>
                {facility.updatedBy && <span className="meta">by {facility.updatedBy}</span>}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default FacilityDetails;
