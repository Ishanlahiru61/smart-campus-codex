import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiTrash2, FiUpload, FiMessageCircle, FiX, FiCheck } from 'react-icons/fi';
import { incidentsAPI } from '../services/api';
import './TicketDetails.css';

function TicketDetails({ ticket, onEdit, onDelete, onBack, onUpdateTicket }) {
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');

  const handleAddAttachment = async () => {
    if (!newFile) return;

    setUploadingFile(true);
    try {
      const response = await incidentsAPI.addAttachment(ticket.id, newFile, 'Current User');
      if (response.success) {
        onUpdateTicket(response.data);
        setNewFile(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const response = await incidentsAPI.addComment(ticket.id, {
        content: newComment,
        commentedBy: 'Current User',
        commentedByRole: 'USER',
      });
      if (response.success) {
        onUpdateTicket(response.data);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPostingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await incidentsAPI.updateStatus(
        ticket.id,
        selectedStatus,
        resolutionNotes,
        ''
      );
      if (response.success) {
        onUpdateTicket(response.data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'badge-open';
      case 'IN_PROGRESS':
        return 'badge-progress';
      case 'RESOLVED':
        return 'badge-resolved';
      case 'CLOSED':
        return 'badge-closed';
      case 'REJECTED':
        return 'badge-rejected';
      default:
        return '';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'badge-critical';
      case 'HIGH':
        return 'badge-high';
      case 'MEDIUM':
        return 'badge-medium';
      case 'LOW':
        return 'badge-low';
      default:
        return '';
    }
  };

  return (
    <div className="ticket-details-page">
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
        {/* Ticket Header */}
        <motion.div className="ticket-header-card" variants={itemVariants}>
          <div className="header-top">
            <div>
              <div className="ticket-number">{ticket.ticketNumber}</div>
              <h1 className="ticket-title-large">{ticket.title}</h1>
            </div>
            <div className="header-actions">
              <motion.button
                className="btn-edit"
                onClick={() => onEdit(ticket)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEdit2 /> Edit
              </motion.button>
              <motion.button
                className="btn-delete"
                onClick={() => {
                  if (window.confirm('Delete this ticket?')) {
                    onDelete(ticket.id);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 />
              </motion.button>
            </div>
          </div>

          <div className="header-badges">
            <div className={`badge ${getStatusBadgeClass(ticket.status)}`}>
              {ticket.status}
            </div>
            <div className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
              {ticket.priority}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div className="tabs-section" variants={itemVariants}>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`tab ${activeTab === 'attachments' ? 'active' : ''}`}
              onClick={() => setActiveTab('attachments')}
            >
              Attachments ({ticket.totalAttachments || 0})
            </button>
            <button
              className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Comments ({ticket.totalComments || 0})
            </button>
          </div>
        </motion.div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <motion.div className="tab-content" variants={itemVariants}>
            <div className="details-grid">
              <div className="detail-card">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <span className="label">Category</span>
                  <span className="value">{ticket.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Facility</span>
                  <span className="value">{ticket.facilityName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Description</span>
                  <span className="value description">{ticket.description}</span>
                </div>
              </div>

              <div className="detail-card">
                <h3>Reporter Information</h3>
                <div className="detail-row">
                  <span className="label">Reported By</span>
                  <span className="value">{ticket.reportedBy}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email</span>
                  <span className="value">{ticket.reportedByEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{ticket.reportedByPhone}</span>
                </div>
              </div>

              <div className="detail-card">
                <h3>Technician Assignment</h3>
                {ticket.assignedTechnician ? (
                  <>
                    <div className="detail-row">
                      <span className="label">Assigned To</span>
                      <span className="value">{ticket.technicianName}</span>
                    </div>
                  </>
                ) : (
                  <div className="unassigned">
                    <p>No technician assigned yet</p>
                  </div>
                )}
              </div>

              <div className="detail-card">
                <h3>Status Update</h3>
                <div className="status-update-form">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  {selectedStatus === 'RESOLVED' && (
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add resolution notes..."
                      className="resolution-textarea"
                    />
                  )}
                  <button
                    className="btn-update-status"
                    onClick={handleStatusUpdate}
                  >
                    <FiCheck /> Update Status
                  </button>
                </div>
              </div>

              <div className="detail-card">
                <h3>Dates</h3>
                <div className="detail-row">
                  <span className="label">Created</span>
                  <span className="value">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Updated</span>
                  <span className="value">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </span>
                </div>
                {ticket.resolvedAt && (
                  <div className="detail-row">
                    <span className="label">Resolved</span>
                    <span className="value">
                      {new Date(ticket.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Attachments Tab */}
        {activeTab === 'attachments' && (
          <motion.div className="tab-content" variants={itemVariants}>
            <div className="attachments-section">
              <div className="upload-area">
                <h3>Upload Evidence (Max 3 Images)</h3>
                <div className="upload-form">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewFile(e.target.files[0])}
                    className="file-input"
                  />
                  <button
                    className="btn-upload"
                    onClick={handleAddAttachment}
                    disabled={!newFile || uploadingFile || (ticket.attachments?.length || 0) >= 3}
                  >
                    <FiUpload /> {uploadingFile ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="attachments-list">
                  <h4>Uploaded Files</h4>
                  {ticket.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                      <div className="attachment-info">
                        <span className="name">{attachment.fileName}</span>
                        <span className="size">({(attachment.fileSize / 1024).toFixed(2)} KB)</span>
                      </div>
                      <span className="uploaded-by">
                        Uploaded by {attachment.uploadedBy}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-attachments">No attachments yet</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <motion.div className="tab-content" variants={itemVariants}>
            <div className="comments-section">
              <div className="add-comment-form">
                <h3>Add Comment</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment..."
                  className="comment-textarea"
                  rows="3"
                />
                <button
                  className="btn-post-comment"
                  onClick={handleAddComment}
                  disabled={postingComment || !newComment.trim()}
                >
                  <FiMessageCircle /> {postingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="comments-list">
                  <h4>Comments ({ticket.comments.length})</h4>
                  {ticket.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="commenter">{comment.commentedBy}</span>
                        <span className="role">{comment.commentedByRole}</span>
                        <span className="date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default TicketDetails;
