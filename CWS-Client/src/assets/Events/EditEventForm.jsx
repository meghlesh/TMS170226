import React, { useState, useEffect } from "react";
import axios from "axios";

function EditEventForm({ eventData, onUpdate, onClose }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (eventData) {
      setName(eventData.name || "");
      setDate(eventData.date ? eventData.date.split("T")[0] : "");
    }
  }, [eventData]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.put(
        `https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/events/${eventData._id}`,
        { name, date }, // ✅ FIXED
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Event updated successfully ✅");

      onUpdate(res.data.event); // backend sends { event: updatedEvent }
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update event ❌");
    }
  };

  if (!eventData) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog"
        style={{ maxWidth: "500px", marginTop: "80px" }}
      >
        <div className="modal-content">
          {/* Header */}
          <div
            className="modal-header text-white"
            style={{ backgroundColor: "#3A5FBE" }}
          >
            <h5 className="modal-title">Edit Event</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Event Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Event Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm custom-outline-btn"
                style={{ minWidth: 90 }}
                onClick={onClose}
              >
                Close
              </button>

              <button
                type="submit"
                className="btn btn-sm custom-outline-btn"
                style={{ minWidth: 90 }}
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditEventForm;
