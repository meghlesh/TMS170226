import React, { useState, useEffect } from "react";
import axios from "axios";

function EditHolidayForm({ holidayData, onUpdate, onClose }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (holidayData) {
      setName(holidayData.name || "");
      setDate(holidayData.date?.split("T")[0] || "");
    }
  }, [holidayData]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.put(
        `https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/holidays/${holidayData._id}`, // ✅ FIXED
        { name, date },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Holiday updated successfully ✅");

      onUpdate(res.data.holiday);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update holiday ❌");
    }
  };

  if (!holidayData) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
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
            <h5 className="modal-title">Edit Holiday</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <form onSubmit={handleUpdate}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Holiday Title</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm custom-outline-btn"
                style={{ minWidth: 90 }}
                onClick={onClose}
              >
                Cancel
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

export default EditHolidayForm;
