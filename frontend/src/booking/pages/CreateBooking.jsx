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

const TIME_OPTIONS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
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

  const availableEndTimeOptions = useMemo(() => {
    if (!formData.startTimeOnly) return TIME_OPTIONS;
    return TIME_OPTIONS.filter((time) => time > formData.startTimeOnly);
  }, [formData.startTimeOnly]);

  const validationErrors = useMemo(() => {
    const errors = {};

    const attendeeCount = Number(formData.attendees);

    if (formData.attendees !== "") {
      if (!Number.isFinite(attendeeCount) || attendeeCount < 1) {
        errors.attendees = "Expected attendees must be at least 1.";
      } else if (
        selectedResource &&
        attendeeCount > selectedResource.capacity
      ) {
        errors.attendees = `Expected attendees cannot exceed capacity (${selectedResource.capacity}).`;
      }
    }

    if (formData.startTimeOnly && formData.endTimeOnly) {
      if (formData.startTimeOnly >= formData.endTimeOnly) {
        errors.timeRange = "Start time must be before end time.";
      }
    }

    return errors;
  }, [
    formData.attendees,
    formData.startTimeOnly,
    formData.endTimeOnly,
    selectedResource,
  ]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
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

      if (!formData.bookingDate) {
        throw new Error("Please select a booking date.");
      }

      if (!formData.startTimeOnly || !formData.endTimeOnly) {
        throw new Error("Please select both start time and end time.");
      }

      if (validationErrors.timeRange) {
        throw new Error(validationErrors.timeRange);
      }

      const attendeeCount = Number(formData.attendees);

      if (!attendeeCount || attendeeCount < 1) {
        throw new Error("Expected attendees must be at least 1.");
      }

      if (validationErrors.attendees) {
        throw new Error(validationErrors.attendees);
      }

      if (!formData.purpose.trim()) {
        throw new Error("Purpose is required.");
      }

      if (!combinedStart || !combinedEnd) {
        throw new Error("Please select booking date, start time, and end time.");
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
      console.log("Create booking error:", err);
      console.log("Backend response:", err?.response?.data);

      const data = err?.response?.data;
      let backendError = "Failed to create booking.";

      if (typeof data === "string") {
        backendError = data;
      } else if (data?.message) {
        backendError = data.message;
      } else if (data?.error) {
        backendError = data.error;
      } else if (data?.errors) {
        backendError = JSON.stringify(data.errors);
      } else if (data) {
        backendError = JSON.stringify(data);
      } else if (err?.message) {
        backendError = err.message;
      }

      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-page booking-page--create-booking">
      <div className="booking-container booking-container--wide">
        <div className="booking-page-header">
          <span className="booking-chip">New Request</span>
          <h1 className="booking-page-title">Create Booking</h1>
          <p className="booking-page-subtitle">
            Reserve a campus resource with a clear time range, purpose, and
            attendee count.
          </p>
        </div>

        <div className="booking-layout booking-layout--refined">
          <div className="booking-panel booking-panel--form">
            {message && (
              <div className="booking-alert booking-alert--success">
                {message}
              </div>
            )}

            {error && (
              <div className="booking-alert booking-alert--error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="booking-form" noValidate>
              <div className="booking-form-grid booking-form-grid--create">
                <div className="booking-field booking-field--full">
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
                    max={selectedResource?.capacity || undefined}
                    placeholder="e.g. 20"
                    required
                    className="booking-input"
                  />
                  {validationErrors.attendees && (
                    <p className="booking-field-error">
                      {validationErrors.attendees}
                    </p>
                  )}
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
                  <select
                    name="startTimeOnly"
                    value={formData.startTimeOnly}
                    onChange={handleChange}
                    required
                    className="booking-input"
                  >
                    <option value="">Select start time</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="booking-field">
                  <label className="booking-label">End Time</label>
                  <select
                    name="endTimeOnly"
                    value={formData.endTimeOnly}
                    onChange={handleChange}
                    required
                    className="booking-input"
                    disabled={!formData.startTimeOnly}
                  >
                    <option value="">Select end time</option>
                    {availableEndTimeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {validationErrors.timeRange && (
                    <p className="booking-field-error">
                      {validationErrors.timeRange}
                    </p>
                  )}
                </div>

                <div className="booking-field booking-field--full">
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
              </div>

              {selectedResource && (
                <div className="booking-resource-card booking-resource-card--inline">
                  <div className="booking-resource-card__icon">🏫</div>

                  <div className="booking-resource-card__content">
                    <span className="booking-resource-card__eyebrow">
                      Selected Resource
                    </span>
                    <h4 className="booking-resource-card__title">
                      {selectedResource.name}
                    </h4>
                    <p>
                      {selectedResource.type} • {selectedResource.location}
                    </p>
                    <p>Capacity: {selectedResource.capacity}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || hasValidationErrors}
                className="booking-button booking-button--primary booking-button--full"
              >
                {loading ? "Submitting..." : "Create Booking"}
              </button>
            </form>
          </div>

          <aside className="booking-panel booking-panel--sidebar booking-panel--preview">
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
                <span>Location</span>
                <strong>{selectedResource?.location || "-"}</strong>
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