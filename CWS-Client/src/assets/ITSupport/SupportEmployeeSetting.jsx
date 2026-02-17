// editing after demo
//try name fetch
import React, { useEffect, useState, useRef } from "react";
import API from "../ITSupport/service/api";
import "../ITSupport/custom.css";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function SupportEmployeeSetting() {
  //   const user=JSON.parse(localStorage.getItem("activeUser"));
  //  console.log(user.name);
  const user = JSON.parse(localStorage.getItem("activeUser"));
  // console.log(user?.name);

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editData, setEditData] = useState(null);
  const [comment, setComment] = useState("");
  const [viewTicket, setViewTicket] = useState(null);
  const navigate = useNavigate();

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedTickets = tickets.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tickets.length / rowsPerPage);
  const [showTickets, setShowTickets] = useState(false);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: "",
    category: "",
    priority: "",
    description: "",
    attachment: [],
  });
  const [errors, setErrors] = useState({});
  // tanvi
  const modalRef = useRef(null);

  useEffect(() => {
    const isModalOpen = !!viewTicket || showRaiseModal || editData;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [viewTicket, showRaiseModal, editData]);

  const isAnyModalOpen = viewTicket || showRaiseModal || editData;

  useEffect(() => {
    if (!isAnyModalOpen || !modalRef.current) return;

    const modal = modalRef.current;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements.length) return;

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    // ⭐ modal open होताच focus
    modal.focus();

    const handleKeyDown = (e) => {
      // ESC key → modal close
      if (e.key === "Escape") {
        e.preventDefault();
        setViewTicket(false);
        setShowRaiseModal(false);
        setEditData(false);
      }

      // TAB key → focus trap
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    modal.addEventListener("keydown", handleKeyDown);

    return () => {
      modal.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewTicket, showRaiseModal, editData]);

  //200 word description limit
  const shortDescription = (text) => {
    const words = text.split(" ");
    return words.length > 5 ? words.slice(0, 5).join(" ") + "..." : text;
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await API.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Fetch tickets error:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 8000);
    return () => clearInterval(interval);
  }, []);

  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;
  // const handleChange = (e) => {
  // setFormData({ ...formData, [e.target.name]: e.target.value });

  //   // Name validation: only letters & spaces
  //   if (name === "employeeName") {
  //     const regex = /^[A-Za-z\s]*$/;
  //     if (!regex.test(value)) return;
  //   }

  //   // Description word limit validation

  //   if (name === "description") {
  //     const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  //     if (wordCount > 200) return;
  //   }
  //   setFormData({ ...formData, [name]: files ? files[0] : value });
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name validation
    if (name === "employeeName") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }

    // Description word limit (200)
    if (name === "description") {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 200) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Final validation before submit
  const validateForm = () => {
    let newErrors = {};

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = "Employee name is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.priority) {
      newErrors.priority = "Please select priority";
    }

    const wordCount = formData.description
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (wordCount > 200) {
      newErrors.description = "Description must be within 200 words";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async () => {
  //   try {
  //     // ✅ ALWAYS validate first
  //     if (!validateForm()) return;

  //     const data = new FormData();
  //     // data.append("employeeName", formData.employeeName);
  //     data.append("category", formData.category);
  //     data.append("priority", formData.priority);
  //     data.append("description", formData.description);

  //     if (Array.isArray(formData.attachment) && formData.attachment.length > 0) {
  //   formData.attachment.forEach((file) => {
  //     data.append("attachment", file);
  //   });
  // }

  //     const res = await API.post("/tickets", data, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     console.log("Ticket created:", res.data);
  //     alert("Support Ticket Submitted Successfully!");

  //     // ✅ Reset form but keep employee name
  //     setFormData({
  //     // const [formData, setFormData] = useState({
  //       employeeName: user?.name || "",
  //       category: "",
  //       priority: "",
  //       description: "",
  //       attachment: []
  //     });

  //     fetchTickets();
  //   } catch (err) {
  //     console.error("Submit ticket error:", err.response || err);
  //     alert("Ticket submit failed");
  //   }
  // };

  // const handleSubmit = async () => {
  //   try {
  //     if (!validateForm()) return;

  //     const data = new FormData();
  //     data.append("category", formData.category);
  //     data.append("priority", formData.priority);
  //     data.append("description", formData.description);

  //     if (Array.isArray(formData.attachment)) {
  //       formData.attachment.forEach((file) => {
  //         data.append("attachment", file);
  //       });
  //     }

  //     const res = await API.post("/tickets", data, {

  //     });

  //     alert("Support Ticket Submitted Successfully!");

  //     setFormData({
  //       employeeName: user?.name || "",
  //       category: "",
  //       priority: "",
  //       description: "",
  //       attachment: [],
  //     });

  //     fetchTickets();
  //   } catch (err) {
  //     console.error("Submit ticket error:", err.response?.data || err);
  //     alert(err.response?.data?.message || "Ticket submit failed");
  //   }
  // };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      const data = new FormData();
      data.append("employeeName", formData.employeeName);
      data.append("category", formData.category);
      data.append("priority", formData.priority);
      data.append("description", formData.description);

      if (Array.isArray(formData.attachment)) {
        formData.attachment.forEach((file) => {
          data.append("attachment", file);
        });
      }

      //snehal code 03 refresh notification and ticket table dtaa
      const res = await API.post("/tickets", data);
      setTickets((prev) => [res.data, ...prev]); // 🔥 instant table update
      window.dispatchEvent(new Event("notificationRefresh")); // 🔥 instant notification
      //snehal code 03 refresh notification and ticket table dtaa

      alert("Support Ticket Submitted Successfully!");

      setFormData({
        employeeName: user?.name || "",
        category: "",
        priority: "",
        description: "",
        attachment: [],
      });

      fetchTickets();
    } catch (err) {
      console.error("Submit ticket error:", err.response?.data || err);
      alert(err.response?.data?.message || "Ticket submit failed");
    }
  };

  //Save changes in edit modal const
  // const saveChanges = async () => {
  //   try {
  //     const data = new FormData();
  //     data.append("employeeName", editData.employeeName);
  //     data.append("category", editData.category);
  //     data.append("priority", editData.priority);
  //     data.append("description", editData.description);
  //     data.append("status", editData.status);

  //     if (editData.attachment instanceof File) {
  //       data.append("attachment", editData.attachment);
  //     }

  //     await API.put(`/tickets/${editData._id}`, data, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     // 🔥 UPDATE TABLE MANUALLY
  //     setTickets((prev) =>
  //       prev.map((t) =>
  //         t._id === editData._id
  //           ? {
  //               ...t,
  //               ...editData,
  //               attachment:
  //                 editData.attachment instanceof File
  //                   ? t.attachment // backend will update on refresh
  //                   : editData.attachment,
  //             }
  //           : t
  //       )
  //     );

  //     setEditData(null);
  //   } catch (err) {
  //     console.error("Save error:", err);
  //   }
  // };

  const saveChanges = async () => {
    try {
      const data = new FormData();

      data.append("employeeName", editData.employeeName);
      data.append("category", editData.category);
      data.append("priority", editData.priority);
      data.append("description", editData.description);
      data.append("status", editData.status);

      // ✅ MULTIPLE FILES SUPPORT
      if (Array.isArray(editData.attachment)) {
        editData.attachment.forEach((file) => {
          if (file instanceof File) {
            data.append("attachment", file);
          }
        });
      }

      // 1️⃣ UPDATE TICKET
      await API.put(`/tickets/${editData._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2️⃣ ADD COMMENT (IF EXISTS)
      if (comment.trim()) {
        await API.post(`/tickets/${editData._id}/comment`, {
          message: comment,
          role: "EMPLOYEE",
        });
      }

      // 3️⃣ FETCH UPDATED TICKET
      const updatedRes = await API.get(`/tickets/${editData._id}`);
      const updatedTicket = updatedRes.data;

      // 4️⃣ UPDATE TABLE
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)),
      );

      // 5️⃣ RESET STATES
      setEditData(null);
      setComment("");

      alert("✅ Changes & comment saved successfully");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save changes");
    }
  };

  ///comment added withvalidation
  const isValidComment = (text) => {
    return text.trim().split(/\s+/).length <= 100;
  };
  const addComment = async () => {
    if (!comment.trim()) return;
    if (!isValidComment(comment)) {
      alert("Comment must be within 100 words");
      return;
    }
    try {
      await API.post(`/tickets/${editData._id}/comment`, {
        message: comment,
        role: "User",
      });
      const res = await API.get(`/tickets/${editData._id}`);
      setEditData(res.data);
      setComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    } //added by rutuja

    try {
      await API.delete(`/tickets/${id}`);
      setSelectedTicket(null);
      fetchTickets();
      alert("Ticket deleted successfully!"); //added by rutuja
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete ticket"); //added by rutuja
    }
  };

  const statusBadge = (status) => {
    let bgColor = "";
    switch (status) {
      case "Open":
        bgColor = "#D1E7FF";
        break;
      case "In Progress":
        bgColor = "#FFF1CC";
        break;
      case "Resolved":
        bgColor = "#D7F5E4";
        break;
      case "Closed":
        bgColor = "#E2E3E5";
        break;
      default:
        bgColor = "#F8D7DA";
    }

    return {
      backgroundColor: bgColor,
      padding: "4px 12px",
      borderRadius: "4px",
      fontSize: "13px",
      fontWeight: "500",
      display: "inline-block",
      width: "120px",
      textAlign: "center",
      color: "#3A5FBE",
    };
  };
  //name fetch const

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        employeeName: user.name,
      }));
    }
  }, []);

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);
  const formatDateOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  //Added by tanvi
  const isAnyPopupOpen = !!viewTicket || showRaiseModal;
  useEffect(() => {
    if (isAnyPopupOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // 🔑 important
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isAnyPopupOpen]);

  return (
    <div className="container-fluid pt-1 px-3" style={{ minHeight: "100vh" }}>
      <style>
        {`
        .status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
          min-width: 120px;
          text-align: center;
        }
        `}
      </style>

      <h3 className="mb-4" style={{ color: "#3A5FBE", fontSize: "25px" }}>
        Support Ticket System
      </h3>

      <div className="text-end mb-3">
        <button
          className="btn btn-sm custom-outline-btn"
          style={{ minWidth: 90 }}
          onClick={() => setShowRaiseModal(true)}
        >
          Raise Support Ticket
        </button>
      </div>

      {/* Raise Ticket Modal */}
      {showRaiseModal && (
        <div
          className="modal fade show"
          ref={modalRef}
          tabIndex="-1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{ maxWidth: "650px", width: "95%" }}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">Raise Support Ticket</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowRaiseModal(false)}
                />
              </div>

              <div className="modal-body">
                <label className="form-label" style={{ color: "#3A5FBE" }}>
                  Employee Name
                </label>
                <input
                  className="form-control form-control-sm mb-1"
                  name="employeeName"
                  value={formData.employeeName}
                  disabled
                />

                <div className="row g-2 mt-2">
                  {/* Category */}
                  <div className="col-md-4">
                    <label className="form-label" style={{ color: "#3A5FBE" }}>
                      Select Category
                    </label>
                    <select
                      className="form-select form-select-sm"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option>Hardware Issue</option>
                      <option>Network Issue</option>
                      <option>Software Issue</option>
                      <option>Other</option>
                    </select>
                    {errors.category && (
                      <small className="text-danger">{errors.category}</small>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="col-md-4">
                    <label className="form-label" style={{ color: "#3A5FBE" }}>
                      Select Priority
                    </label>
                    <select
                      className="form-select form-select-sm"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="">Select Priority</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                    {errors.priority && (
                      <small className="text-danger">{errors.priority}</small>
                    )}
                  </div>

                  {/* Attachment */}
                  <div className="col-md-4">
                    <label className="form-label" style={{ color: "#3A5FBE" }}>
                      Select File
                    </label>
                    <input
                      type="file"
                      multiple
                      className="form-control form-control-sm mb-1"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attachment: [...e.target.files],
                        })
                      }
                    />
                  </div>
                </div>

                {/* Description */}
                <label className="form-label mt-3" style={{ color: "#3A5FBE" }}>
                  Enter Description (Max 200 words)
                </label>
                <textarea
                  className="form-control form-control-sm mb-1"
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your issue"
                />

                <br />
                {errors.description && (
                  <small className="text-danger">{errors.description}</small>
                )}

                <div className="text-end">
                  <button
                    className="btn btn-sm custom-outline-btn"
                    style={{ minWidth: 90 }}
                    onClick={handleSubmit}
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive bg-white">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: "#ffffffff" }}>
              <tr>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Priority
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Attachment
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Assigned
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Raised Date
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Closed Date
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedTickets.map((t) => (
                <tr
                  key={t._id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setViewTicket(t)}
                >
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {t.ticketId}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {t.category}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {t.priority}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {shortDescription(t.description)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {Array.isArray(t.attachment) && t.attachment.length > 0
                      ? t.attachment.map((file, i) => (
                          <div key={i}>{file.split("/").pop()}</div>
                        ))
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={statusBadge(t.status)}>{t.status}</span>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {t.assignedTo || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {formatDateOnly(t.raisedDate)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      color: "#212529",
                    }}
                  >
                    {formatDateOnly(t.closedDate)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="btn btn-sm custom-outline-btn"
                        style={{ minWidth: 90 }}
                        disabled={t.status === "Closed"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (t.status !== "Closed") {
                            setSelectedTicket(t);
                            setEditData({ ...t });
                          }
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm custom-outline-btn"
                        style={{ minWidth: 90 }}
                        disabled={t.status === "Closed"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (t.status !== "Closed") {
                            deleteTicket(t._id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span
              style={{ fontSize: "14px", marginRight: "8px", color: "#212529" }}
            >
              Rows per page:
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto", fontSize: "14px" }}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <span
            style={{ fontSize: "14px", marginLeft: "16px", color: "#212529" }}
          >
            {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, tickets.length)} of{" "}
            {tickets.length}
          </span>

          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "16px" }}
          >
            <button
             className="btn btn-sm focus-ring"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
            >
              ‹
            </button>
            <button
              cclassName="btn btn-sm focus-ring"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
            >
              ›
            </button>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="text-end mt-3">
        <button
          className="btn btn-sm custom-outline-btn"
          style={{ minWidth: 90 }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>

      {/* View Ticket Modal */}
      {viewTicket && (
        <div
          className="modal fade show"
          ref={modalRef}
          tabIndex="-1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{ maxWidth: "650px", width: "95%" }}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">View Ticket</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setViewTicket(null)}
                />
              </div>

              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Ticket ID
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.ticketId}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Employee Name
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.employeeName}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Category
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.category}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Priority
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.priority}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Description
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.description}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Attachment
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {Array.isArray(viewTicket.attachment) &&
                      viewTicket.attachment.length > 0
                        ? viewTicket.attachment.map((file, i) => (
                            <div key={i}>
                              <a
                                href={`https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/uploads/${file}`}
                                download
                                className="btn btn-sm btn-outline-primary mb-1"
                              >
                                ⬇ download {file.split("/").pop()}
                              </a>
                            </div>
                          ))
                        : "-"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Status
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      <span style={statusBadge(viewTicket.status)}>
                        {viewTicket.status}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Assigned To
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.assignedTo || "-"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Raised Date
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {new Date(viewTicket.raisedDate).toLocaleString()}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Closed Date
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {viewTicket.closedDate
                        ? new Date(viewTicket.closedDate).toLocaleString()
                        : "-"}
                    </div>
                  </div>

                  {viewTicket.comments && viewTicket.comments.length > 0 && (
                    <div className="row mb-2">
                      <div
                        className="col-5 col-sm-3 fw-semibold"
                        style={{ color: "#212529" }}
                      >
                        Comments
                      </div>
                      <div className="col-7 col-sm-9">
                        <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                          {viewTicket.comments.map((c, i) => (
                            <div key={i} className="mb-2 p-2 bg-light rounded">
                              <small className="text-muted d-block">
                                {c.timestamp
                                  ? new Date(c.timestamp).toLocaleString()
                                  : ""}
                              </small>
                              <div>
                                <b>{c.role}:</b> {c.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn custom-outline-btn"
                  onClick={() => setViewTicket(null)}
                >
                  Close
                </button>
                <button
                  className="btn custom-outline-btn"
                  disabled={viewTicket.status === "Closed"}
                  onClick={() => {
                    if (viewTicket.status !== "Closed") {
                      setEditData({ ...viewTicket });
                      setViewTicket(null);
                    }
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editData && (
        <div
          className="modal fade show"
          ref={modalRef}
          tabIndex="-1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{ maxWidth: "650px", width: "95%" }}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">Edit Ticket</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditData(null)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Employee Name
                  </label>
                  <input
                    className="form-control"
                    value={editData.employeeName}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                  >
                    <option>Hardware Issue</option>
                    <option>Network Issue</option>
                    <option>Software Issue</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Priority</label>
                  <select
                    className="form-select"
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Update Attachment
                  </label>
                  <input
                    type="file"
                    multiple
                    className="form-control"
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        attachment: [...e.target.files],
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editData.description}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/);
                      if (words.length <= 200) {
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        });
                      }
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={editData.status}
                    disabled
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Add Comment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add your comment here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                {/*  Comments  */}
                {editData.comments && editData.comments.length > 0 && (
                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Previous Comments
                    </div>

                    <div className="col-7 col-sm-9">
                      <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {[...(editData.comments || [])]
                          .reverse()
                          .map((comment, index) => (
                            <div
                              key={index}
                              className="mb-2 p-2 bg-light rounded"
                            >
                              {comment.timestamp && (
                                <small className="text-muted d-block">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </small>
                              )}
                              <div>
                                <b>{comment.role || "User"}:</b>{" "}
                                {comment.message}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn custom-outline-btn"
                  onClick={saveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportEmployeeSetting;
