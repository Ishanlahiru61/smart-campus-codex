import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiX, FiUpload } from 'react-icons/fi';
import './TicketForm.css';

function TicketForm({ ticket, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    facilityId: '',
    facilityName: '',
    category: 'ELECTRICAL',
    title: '',
    description: '',
    priority: 'MEDIUM',
    reportedBy: '',
    reportedByEmail: '',
    reportedByPhone: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        facilityId: ticket.facilityId,
        facilityName: ticket.facilityName,
        category: ticket.category,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        reportedBy: ticket.reportedBy,
        reportedByEmail: ticket.reportedByEmail,
        reportedByPhone: ticket.reportedByPhone,
      });
    }
  }, [ticket]);

  const categories = ['ELECTRICAL', 'PLUMBING', 'STRUCTURAL', 'EQUIPMENT', 'SAFETY', 'OTHER'];
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.facilityName.trim()) {
      newErrors.facilityName = 'Facility name is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.reportedBy.trim()) {
      newErrors.reportedBy = 'Your name is required';
    }

    if (formData.reportedByEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reportedByEmail)) {
      newErrors.reportedByEmail = 'Invalid email format';
    }

    if (formData.reportedByPhone && !/^[+]?[0-9]{10,}$/.test(formData.reportedByPhone)) {
      newErrors.reportedByPhone = 'Invalid phone number';
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
      if (ticket?.id) {
        await onSubmit(ticket.id, formData);
      } else {
        await onSubmit(formData);
      }
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
    <div className="ticket-form-page">
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
          <h1>{ticket ? 'Edit Ticket' : 'Create New Ticket'}</h1>
          <p>
            {ticket
              ? 'Update incident ticket information'
              : 'Report a new maintenance or incident ticket'}
          </p>
        </div>
      </motion.div>

      <motion.form
        className="ticket-form"
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="form-section">
          <h2>Incident Information</h2>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'input-error' : ''}
              placeholder="Brief description of the issue"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'input-error' : ''}
              placeholder="Detailed description of the incident..."
              rows="5"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </motion.div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>
        </div>

        <div className="form-section">
          <h2>Facility Information</h2>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="facilityName">
              Facility Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="facilityName"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleInputChange}
              className={errors.facilityName ? 'input-error' : ''}
              placeholder="e.g., Computer Lab A"
            />
            {errors.facilityName && <span className="error-text">{errors.facilityName}</span>}
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="facilityId">Facility ID</label>
            <input
              type="text"
              id="facilityId"
              name="facilityId"
              value={formData.facilityId}
              onChange={handleInputChange}
              placeholder="Optional facility ID"
            />
          </motion.div>
        </div>

        <div className="form-section">
          <h2>Your Contact Information</h2>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="reportedBy">
              Your Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="reportedBy"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleInputChange}
              className={errors.reportedBy ? 'input-error' : ''}
              placeholder="Your full name"
            />
            {errors.reportedBy && <span className="error-text">{errors.reportedBy}</span>}
          </motion.div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="reportedByEmail">Email</label>
              <input
                type="email"
                id="reportedByEmail"
                name="reportedByEmail"
                value={formData.reportedByEmail}
                onChange={handleInputChange}
                className={errors.reportedByEmail ? 'input-error' : ''}
                placeholder="your.email@example.com"
              />
              {errors.reportedByEmail && <span className="error-text">{errors.reportedByEmail}</span>}
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="reportedByPhone">Phone</label>
              <input
                type="tel"
                id="reportedByPhone"
                name="reportedByPhone"
                value={formData.reportedByPhone}
                onChange={handleInputChange}
                className={errors.reportedByPhone ? 'input-error' : ''}
                placeholder="+94112345678"
              />
              {errors.reportedByPhone && <span className="error-text">{errors.reportedByPhone}</span>}
            </motion.div>
          </div>
        </div>

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
            <FiSave /> {loading ? 'Saving...' : ticket ? 'Update Ticket' : 'Create Ticket'}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default TicketForm;
