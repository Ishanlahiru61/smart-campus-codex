import { useMemo, useState } from "react";
import bookingApi from "../services/bookingApi";
import {
  combineDateAndTime,
  DEMO_USER_ID,
  formatDateTime,
} from "../utils/bookingFormat";

const MOCK_RESOURCES = [
  {
    id: "res001",
    name: "Lecture Hall A",
    type: "Lecture Hall",
    location: "Block A",
    capacity: 120,
  },
  {
    id: "res002",
    name: "Computer Lab 1",
    type: "Computer Lab",
    location: "Block B - Floor 2",
    capacity: 40,
  },
  {
    id: "res003",
    name: "Main Auditorium",
    type: "Auditorium",
    location: "Main Building",
    capacity: 300,
  },
  {
    id: "res004",
    name: "Biology Lab",
    type: "Laboratory",
    location: "Science Wing",
    capacity: 35,
  },
  {
    id: "res005",
    name: "Meeting Room 2",
    type: "Meeting Room",
    location: "Admin Block",
    capacity: 12,
  },
];

export default function CreateBooking() {
  const [formData, setFormData] = useState({
    resourceId: "",
    bookingDate: "",
    startTimeOnly: "",
    endTimeOnly: "",
    purpose: "",
    attendees: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedResource = useMemo(() => {
    return (
      MOCK_RESOURCES.find((resource) => resource.id === formData.resourceId) ||
      null
    );
  }, [formData.resourceId]);

  const combinedStart = useMemo(
    () => combineDateAndTime(formData.bookingDate, formData.startTimeOnly),
    [formData.bookingDate, formData.startTimeOnly]
  );

  const combinedEnd = useMemo(
    () => combineDateAndTime(formData.bookingDate, formData.endTimeOnly),
    [formData.bookingDate, formData.endTimeOnly]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      resourceId: "",
      bookingDate: "",
      startTimeOnly: "",
      endTimeOnly: "",
      purpose: "",
      attendees: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!formData.resourceId) {
        throw new Error("Please select a resource.");
      }

      if (!combinedStart || !combinedEnd) {
        throw new Error("Please select booking date, start time, and end time.");
      }

      if (combinedStart >= combinedEnd) {
        throw new Error("End time must be after start time.");
      }

      const attendeeCount = Number(formData.attendees);

      if (!attendeeCount || attendeeCount < 1) {
        throw new Error("Attendees must be at least 1.");
      }

      const payload = {
        resourceId: formData.resourceId,
        userId: DEMO_USER_ID,
        startTime: combinedStart,
        endTime: combinedEnd,
        purpose: formData.purpose.trim(),
        attendees: attendeeCount,
      };

      await bookingApi.createBooking(payload);

      setMessage("Booking created successfully.");
      resetForm();
    } catch (err) {
      const backendError =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create booking.";

      setError(String(backendError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-page">
      <div className="booking-container booking-container--wide">
        <div className="booking-page-header">
          <span className="booking-chip">New Request</span>
          <h1 className="booking-page-title">Create Booking</h1>
          <p className="booking-page-subtitle">
            Reserve a campus resource with a clear time range, purpose, and
            attendee count.
          </p>
        </div>

        <div className="booking-layout">
          <div className="booking-panel">
            {message && (
              <div className="booking-alert booking-alert--success">
                {message}
              </div>
            )}
            {error && (
              <div className="booking-alert booking-alert--error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="booking-form-grid">
                <div className="booking-field">
                  <label className="booking-label">Resource</label>
                  <select
                    name="resourceId"
                    value={formData.resourceId}
                    onChange={handleChange}
                    required
                    className="booking-input"
                  >
                    <option value="">Select a resource</option>
                    {MOCK_RESOURCES.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} - {resource.type} - {resource.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="booking-field">
                  <label className="booking-label">Expected Attendees</label>
                  <input
                    type="number"
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 20"
                    required
                    className="booking-input"
                  />
                </div>

                <div className="booking-field">
                  <label className="booking-label">Booking Date</label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    required
                    className="booking-input"
                  />
                </div>

                <div className="booking-field">
                  <label className="booking-label">Start Time</label>
                  <input
                    type="time"
                    name="startTimeOnly"
                    value={formData.startTimeOnly}
                    onChange={handleChange}
                    required
                    className="booking-input"
                  />
                </div>

                <div className="booking-field">
                  <label className="booking-label">End Time</label>
                  <input
                    type="time"
                    name="endTimeOnly"
                    value={formData.endTimeOnly}
                    onChange={handleChange}
                    required
                    className="booking-input"
                  />
                </div>
              </div>

              {selectedResource && (
                <div className="booking-field">
                  <div className="booking-resource-card">
                    <h4 className="booking-resource-card__title">
                      Selected Resource
                    </h4>
                    <p>
                      <strong>{selectedResource.name}</strong>
                    </p>
                    <p>
                      {selectedResource.type} • {selectedResource.location}
                    </p>
                    <p>Capacity: {selectedResource.capacity}</p>
                  </div>
                </div>
              )}

              <div className="booking-field">
                <label className="booking-label">Purpose</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Enter the purpose of the booking"
                  required
                  className="booking-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="booking-button booking-button--primary booking-button--full"
              >
                {loading ? "Submitting..." : "Create Booking"}
              </button>
            </form>
          </div>

          <aside className="booking-panel booking-panel--sidebar">
            <h3 className="booking-section-title">Request Preview</h3>

            <div className="booking-preview">
              <div className="booking-preview__row">
                <span>Resource</span>
                <strong>{selectedResource?.name || "-"}</strong>
              </div>

              <div className="booking-preview__row">
                <span>Type</span>
                <strong>{selectedResource?.type || "-"}</strong>
              </div>

              <div className="booking-preview__row">
                <span>Start</span>
                <strong>{formatDateTime(combinedStart)}</strong>
              </div>

              <div className="booking-preview__row">
                <span>End</span>
                <strong>{formatDateTime(combinedEnd)}</strong>
              </div>

              <div className="booking-preview__row">
                <span>Attendees</span>
                <strong>{formData.attendees || 0}</strong>
              </div>

              <div className="booking-preview__row">
                <span>Status</span>
                <strong>PENDING</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}