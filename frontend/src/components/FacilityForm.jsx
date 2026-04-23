import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import './FacilityForm.css';

function FacilityForm({ facility, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    description: '',
    status: 'ACTIVE',
    amenities: [],
    floorNumber: '',
    buildingCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    costPerHour: '',
    requiresApproval: false,
    latitude: '',
    longitude: '',
    imageUrl: '',
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (facility) {
      setFormData(facility);
    }
  }, [facility]);

  const facilityTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
  const statusOptions = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Facility name must be at least 3 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (formData.contactPhone && !/^[+]?[0-9]{10,}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Phone number must be at least 10 digits';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (facility?.id) {
        await onSubmit(facility.id, formData);
      } else {
        await onSubmit(formData);
      }
      setSuccessMessage(
        facility ? 'Facility updated successfully!' : 'Facility created successfully!'
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="facility-form-page">
      <motion.div
        className="form-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-btn" onClick={onCancel}>
          <FiArrowLeft /> Back
        </button>
        <div>
          <h1>{facility ? 'Edit Facility' : 'Create New Facility'}</h1>
          <p>
            {facility
              ? 'Update facility information and details'
              : 'Add a new facility to the campus catalogue'}
          </p>
        </div>
      </motion.div>

      {successMessage && (
        <motion.div
          className="success-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {successMessage}
        </motion.div>
      )}

      <motion.form
        className="facility-form"
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="form-section">
          <h2>Basic Information</h2>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name">
              Facility Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter facility name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </motion.div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="type">
                Facility Type <span className="required">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {facilityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="status">
                Status <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the facility..."
              rows="4"
            />
          </motion.div>
        </div>

        <div className="form-section">
          <h2>Location & Capacity</h2>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="location">
              Location <span className="required">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={errors.location ? 'input-error' : ''}
              placeholder="e.g., Building A, Floor 3"
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </motion.div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="capacity">
                Capacity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className={errors.capacity ? 'input-error' : ''}
                placeholder="Number of people"
                min="1"
              />
              {errors.capacity && <span className="error-text">{errors.capacity}</span>}
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="floorNumber">Floor Number</label>
              <input
                type="number"
                id="floorNumber"
                name="floorNumber"
                value={formData.floorNumber}
                onChange={handleInputChange}
                placeholder="e.g., 3"
              />
            </motion.div>
          </div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="buildingCode">Building Code</label>
              <input
                type="text"
                id="buildingCode"
                name="buildingCode"
                value={formData.buildingCode}
                onChange={handleInputChange}
                placeholder="e.g., BLD-A"
              />
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="costPerHour">Cost Per Hour (Optional)</label>
              <input
                type="number"
                id="costPerHour"
                name="costPerHour"
                value={formData.costPerHour}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </motion.div>
          </div>
        </div>

        <div className="form-section">
          <h2>Contact Information</h2>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="contactPerson">Contact Person</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              placeholder="Name of contact person"
            />
          </motion.div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="contactEmail">Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className={errors.contactEmail ? 'input-error' : ''}
                placeholder="contact@example.com"
              />
              {errors.contactEmail && (
                <span className="error-text">{errors.contactEmail}</span>
              )}
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="contactPhone">Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className={errors.contactPhone ? 'input-error' : ''}
                placeholder="+1234567890"
              />
              {errors.contactPhone && (
                <span className="error-text">{errors.contactPhone}</span>
              )}
            </motion.div>
          </div>
        </div>

        <div className="form-section">
          <h2>Amenities</h2>

          <motion.div className="amenities-input" variants={itemVariants}>
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              placeholder="Add amenity (e.g., Projector, WiFi)"
            />
            <button
              type="button"
              className="btn-add-amenity"
              onClick={handleAddAmenity}
            >
              Add
            </button>
          </motion.div>

          {formData.amenities.length > 0 && (
            <motion.div className="amenities-list" variants={itemVariants}>
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="remove-amenity"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div className="form-section" variants={itemVariants}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="requiresApproval"
              checked={formData.requiresApproval}
              onChange={handleInputChange}
            />
            <span>Requires Booking Approval</span>
          </label>
        </motion.div>

        <motion.div className="form-actions" variants={itemVariants}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
          >
            <FiX /> Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            <FiSave /> {loading ? 'Saving...' : facility ? 'Update Facility' : 'Create Facility'}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default FacilityForm;
