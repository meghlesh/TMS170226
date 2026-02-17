import React, { useState, useEffect } from "react";
import axios from "axios";

function EditAnnouncementForm({ data, onClose, onUpdate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDescription(data.description);
      setCategory(data.category);
    }
  }, [data]);

  // const handleUpdate = async (e) => {
  //   e.preventDefault();
  //   const token = localStorage.getItem("accessToken");

  //   const formData = new FormData();
  //   formData.append("name", name);
  //   formData.append("description", description);
  //   formData.append("category", category);
  //   if (image) formData.append("image", image);

  //   const res = await axios.put(
  //     `https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/announcements/${data._id}`,
  //     formData,
  //     { headers: { Authorization: `Bearer ${token}` } }
  //   );

  //   onUpdate(res.data.data);
  //   onClose();
  // };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      if (image) formData.append("image", image);

      const res = await axios.put(
        `https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/announcements/${data._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // ✅ SUCCESS ALERT
      alert("Announcement updated successfully ✅");

      onUpdate(res.data.data);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update announcement ❌");
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-scrollable"
        style={{
          maxWidth: "650px",
          width: "95%",
          marginTop: "60px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div className="modal-content">
          {/* Header */}
          <div
            className="modal-header text-white"
            style={{ backgroundColor: "#3A5FBE" }}
          >
            <h5 className="modal-title mb-0">Edit Announcement </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <form onSubmit={handleUpdate} className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Announcement Name
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Upload Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            {/* Buttons Right Side */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-sm custom-outline-btn"
                onClick={onClose}
                style={{ minWidth: 90 }}
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

export default EditAnnouncementForm;
