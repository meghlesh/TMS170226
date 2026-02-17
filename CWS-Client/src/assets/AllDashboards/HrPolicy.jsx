import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net";

const STORAGE_KEY = "hr_policy";
const ACK_KEY = "policy_ack_employee";

function HrPolicy() {
  const { role, username, id } = useParams();

  const canEdit = role === "admin" || role === "hr";

  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    description: "",
  });

  const [policies, setPolicies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [editFile, setEditFile] = useState(null);//added by shivani
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ackMap, setAckMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPolicy, setStatusPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState("read");
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPolicy, setViewPolicy] = useState(null);
  const modalRef = useRef(null);
  const isAnyModalOpen =
    showViewModal ||
    showModal ||
    showAddModal ||
    showStatusModal ||
    statusPolicy;

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
        setShowViewModal(false);
        setShowModal(false);
        setShowAddModal(false);
        setShowStatusModal(false);
        setStatusPolicy(false);
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
  }, [isAnyModalOpen]);
  const handleViewClick = (policy) => {
    console.log("Selected Policy:", policy);
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const handleRowClick = (policy) => {
    setViewPolicy(policy);
    setShowViewModal(true);
  };

  const getReadEmployees = (policyId) => {
    return Object.values(ackMap).filter((ack) => ack.policyId === policyId);
  };

  const getPendingEmployees = (policyId) => {
    const readIds = getReadEmployees(policyId).map((e) => e.employeeId);

    const allEmployees = JSON.parse(localStorage.getItem("employees")) || [];

    return allEmployees.filter((emp) => !readIds.includes(emp.id));
  };

  const getAckStatus = (policyId, employeeId) => {
    return ackMap?.[`${policyId}_${employeeId}`] || null;
  };
  const getAllAcksForPolicy = (policyId) => {
    return Object.entries(ackMap)
      .filter(([key]) => key.startsWith(`${policyId}_`))
      .map(([_, value]) => value);
  };

  useEffect(() => {
    const syncAck = () => {
      const stored = JSON.parse(localStorage.getItem(ACK_KEY)) || {};
      setAckMap(stored);
    };

    window.addEventListener("storage", syncAck);

    return () => window.removeEventListener("storage", syncAck);
  }, []);

  const [policyForm, setPolicyForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const storedAck =
      JSON.parse(localStorage.getItem("policy_acknowledgements")) || {};
    setAckMap(storedAck);
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, []);

  // const handleAddPolicy = async () => {
  //   if (!newPolicy.title || !newPolicy.description) {
  //     alert("Title and Description required");
  //     return;
  //   }

  //   try {
  //     const res = await axios.post(`${API_BASE}/policy/create`, {
  //       title: newPolicy.title,
  //       description: newPolicy.description,
  //       image: newPolicy.pdf ? newPolicy.pdf.name : null,
  //     });

  //     if (res.data.success) {
  //       alert(res.data.message);
  //       setShowAddModal(false);
  //       setNewPolicy({ title: "", description: "", pdf: null });

  //       // 🔄 Refresh table
  //       fetchPolicies();
  //     }
  //   } catch (error) {
  //     console.error("Failed to add policy", error);
  //     alert("Failed to create policy");
  //   }
  // };

  //update by shivani
  const handleAddPolicy = async () => {
    if (!newPolicy.title || !newPolicy.description) {
      alert("Title and Description required");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("title", newPolicy.title);
      formData.append("description", newPolicy.description);
  
      if (newPolicy.pdf) {
        formData.append("pdf", newPolicy.pdf); 
      }
  
      const res = await axios.post(
        `${API_BASE}/policy/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (res.data.success) {
        alert(res.data.message);
        setShowAddModal(false);
        setNewPolicy({ title: "", description: "", pdf: null });
        fetchPolicies();
      }
    } catch (error) {
      console.error("Failed to add policy", error);
      alert("Failed to create policy");
    }
  };


  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/policy/get`);
      if (res.data.success) {
        setPolicies(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch policies", error);
    }
  };

  const persist = (updated) => {
    setPolicies(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSearch = () => {
    setSearchQuery(searchText);
  };
  const handleReset = () => {
    setSearchText("");
    setSearchQuery("");
  };

  const filteredPolicies = policies.filter((p) =>
    `${p.title || ""} ${p.description || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const totalItems = filteredPolicies.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  const currentPolicies = filteredPolicies.slice(startIndex, endIndex);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, rowsPerPage]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleEditClick = (policy) => {
    setSelectedPolicy(policy);

    setPolicyForm({
      title: policy.title || "",
      description: policy.description || "",
      version: policy.version || "1.0",
      createdAt: policy.createdAt || today,
    });
    setEditFile(null);// added by shivani
    setIsEditMode(true);
    setShowModal(true);
  };

  //update by shivani
  const handleSave = async () => {
    if (!selectedPolicy) return;
  
    try {
      const formData = new FormData();
      formData.append("title", policyForm.title);
      formData.append("description", policyForm.description);
  
      if (editFile) {
        formData.append("pdf", editFile); // ✅ only if new file selected
      }
  
      const res = await axios.put(
        `${API_BASE}/policy/update/${selectedPolicy._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (res.data.success) {
        alert(res.data.message);
        fetchPolicies();
        setShowModal(false);
        setIsEditMode(false);
        setSelectedPolicy(null);
        setEditFile(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update policy");
    }
  };

  const deletePolicy = async (pid) => {
    if (!window.confirm("Delete this policy?")) return;

    try {
      const res = await axios.delete(`${API_BASE}/policy/delete/${pid}`);

      if (res.data.success) {
        alert(res.data.message); // ✅ SHOW MESSAGE
        fetchPolicies();
      }
    } catch (error) {
      alert("Failed to delete policy");
    }
  };

  const thStyle = {
    fontWeight: "500",
    fontSize: "14px",
    color: "#6c757d",
    borderBottom: "2px solid #dee2e6",
    padding: "12px",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "12px",
    verticalAlign: "middle",
    fontSize: "14px",
    borderBottom: "1px solid #dee2e6",
    whiteSpace: "nowrap",
  };

  const isNewPolicy = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    if (isNaN(created)) return false;

    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };
  const allEmployees = [
    { id: "101", name: "Rahul" },
    { id: "102", name: "Sneha" },
  ];

  const isUpdatedPolicy = (policy) => {
    if (!policy.createdAt || !policy.updatedAt) return false;
    return policy.updatedAt !== policy.createdAt;
  };

  <button className="btn btn-sm custom-outline-btn" onClick={handleAddPolicy}>
    Save Policy
  </button>;
  useEffect(() => {
    const loadAck = () => {
      const stored = JSON.parse(localStorage.getItem(ACK_KEY)) || {};
      setAckMap(stored);
    };

    loadAck();
    window.addEventListener("storage", loadAck);

    return () => window.removeEventListener("storage", loadAck);
  }, []);

  return (
    <div className="container-fluid ">
      <div className="d-flex justify-content-between mb-3">
        <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
          HR Policies
        </h2>

        {canEdit && (
          <button
            className="btn btn-sm custom-outline-btn"
            onClick={() => setShowAddModal(true)}
            style={{ minWidth: 90, height: 30 }}
          >
            Add New Policy
          </button>
        )}
      </div>

      {/* 
//Added by mahesh */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            {/* Search Input */}
            <div
              className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 w-md-100"
              style={{ maxWidth: "400px" }}
            >
              <label
                className="fw-bold mb-0"
                style={{ fontSize: "16px", color: "#3A5FBE" }}
              >
                Search
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search By Any Field..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Filter and Reset Buttons */}
            <div className="d-flex gap-2 ms-auto">
              <button
                type="button"
                style={{ minWidth: 90 }}
                className="btn btn-sm custom-outline-btn"
                onClick={handleSearch}
              >
                Filter
              </button>
              <button
                type="button"
                style={{ minWidth: 90 }}
                className="btn btn-sm custom-outline-btn"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive bg-white">
          <table className="table table-hover mb-0">
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={thStyle}>Policy Title</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Read Date & Time</th>
                <th style={thStyle}>Uploaded File</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentPolicies.map((policy) => (
                <tr
                  key={policy._id}
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    cursor: "pointer",
                  }}
                  onClick={() => handleRowClick(policy)}
                >
                  {/* ✅ TITLE + BADGES */}
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {policy.title}

                    {/* 🆕 NEW */}
                    {isNewPolicy(policy.createdAt) && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "11px",
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        NEW
                      </span>
                    )}

                    {/* ✏️ UPDATED */}
                    {isUpdatedPolicy(policy) && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "11px",
                          background: "#e0f2fe",
                          color: "#075985",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        UPDATED
                      </span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={policy.description} // optional: show full text on hover
                    >
                      {policy.description}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <button
                      className="btn btn-sm custom-outline-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusPolicy(policy);
                        setShowStatusModal(true);
                      }}
                    >
                      View Status
                    </button>
                  </td>

                  <td style={tdStyle}>
                    {(() => {
                      const acks = getAllAcksForPolicy(policy._id);

                      if (acks.length === 0) return "-";

                      const latest = acks
                        .map((a) => new Date(a.acknowledgedAt))
                        .sort((a, b) => b - a)[0];

                      return latest.toLocaleString();
                    })()}
                  </td>

                  {/* //Added by Shivani */}

                  <td style={tdStyle}>
                    {policy.image ? (
                      <a
                        href={`${API_BASE}/uploads/${policy.image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // prevent row click
                        style={{
                          color: "#3A5FBE",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        📄 View File
                      </a>
                    ) : (
                      <span style={{ color: "#9ca3af" }}></span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {canEdit ? (
                        <>
                          <button
                            className="btn btn-sm custom-outline-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(policy);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePolicy(policy._id);
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#dc3545";
                              e.target.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#dc3545";
                            }}
                            style={{
                              border: "1px solid #dc3545",
                              color: "#dc3545",
                              background: "transparent",
                            }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm custom-outline-btn"
                          onClick={() => handleViewClick(policy)}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showViewModal && viewPolicy && (
        <div
          className="modal fade show"
          ref={modalRef}
          tabIndex="-1"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
            overflowX: "auto",
          }}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: "650px", width: "95%", marginTop: "120px" }}
          >
            <div className="modal-content">
              {/* HEADER */}
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">View Policy</h5>
                <button
                  className="btn-close btn-close-white p-1"
                  onClick={() => setShowViewModal(false)}
                />
              </div>

              {/* BODY */}
              <div className="modal-body">
                <div className="mb-2 row">
                  <label className="col-4 form-label fw-semibold mb-0">
                    Policy Title
                  </label>
                  <div className="col-8">
                    <p className="mb-0">{viewPolicy.title}</p>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label className="col-4 form-label fw-semibold mb-0">
                    Description
                  </label>
                  <div className="col-8">
                    <p
                      className="mb-0"
                      style={{
                        maxHeight: "120px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: "1.5",
                        paddingRight: "6px",
                      }}
                    >
                      {viewPolicy.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="d-flex justify-content-end gap-2 p-3">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: "90px" }}
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedPolicy && (
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
            className="modal-dialog"
            style={{ maxWidth: "650px", width: "95%", marginTop: "120px" }}
          >
            <div className="modal-content">
              {/* HEADER */}
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">Edit Policy</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {/* BODY */}
              <div className="modal-body">
                <label className="fw-semibold mb-1">Policy Title</label>
                <input
                  className="form-control mb-3"
                  value={policyForm.title}
                  onChange={(e) =>
                    setPolicyForm({ ...policyForm, title: e.target.value })
                  }
                />

                <label className="fw-semibold mb-1">Policy Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={policyForm.description}
                  onChange={(e) =>
                    setPolicyForm({
                      ...policyForm,
                      description: e.target.value,
                    })
                  }
                />

                {/* added by shivani */}
                <label className="fw-semibold mb-1 mt-2">Upload Policy PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="form-control"
                    onChange={(e) => setEditFile(e.target.files[0])}
                    
                  />

              {/*  */}
              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={handleSave}
                >
                  Save
                </button>

                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
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
            marginTop: "40px",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {/* HEADER */}
              <div
                className="modal-header"
                style={{ background: "#3A5FBE", color: "#fff" }}
              >
                <h5 className="modal-title">Add New Policy</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>

              {/* BODY */}
              <div
                className="modal-body"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Policy Title</label>
                    <input
                      className="form-control"
                      placeholder="Enter policy title"
                      value={newPolicy.title}
                      onChange={(e) =>
                        setNewPolicy({ ...newPolicy, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Policy Description</label>

                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Enter policy description"
                      maxLength={200}
                      value={newPolicy.description}
                      onChange={(e) =>
                        setNewPolicy({
                          ...newPolicy,
                          description: e.target.value,
                        })
                      }
                    />

                    {/* Character count */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        fontSize: "12px",
                        color: "#6c757d",
                        marginTop: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {newPolicy.description.length}/200
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Upload Policy PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="form-control"
                      onChange={(e) =>
                        setNewPolicy({ ...newPolicy, pdf: e.target.files[0] })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm custom-outline-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-sm custom-outline-btn"
                  onClick={handleAddPolicy}
                >
                  Save Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <div
          ref={modalRef}
          tabIndex="-1"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#475569",
            borderTop: "1px solid #e5e7eb",
            marginTop: "18px",
          }}
        >
          {/* Rows per page */}
          <span>Rows per page:</span>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>

          <span>
            {startIndex + 1}-{endIndex} of {totalItems}
          </span>

          {/* Prev */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: currentPage === 1 ? "#cbd5e1" : "#334155",
            }}
          >
            ‹
          </button>

          {/* Next */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              color: currentPage === totalPages ? "#cbd5e1" : "#334155",
            }}
          >
            ›
          </button>
        </div>
      )}

      <div className="text-end mt-3">
        <button
          style={{ minWidth: 90 }}
          className="btn btn-sm custom-outline-btn"
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
      {showStatusModal &&
        statusPolicy &&
        (() => {
          const readEmployees = getAllAcksForPolicy(statusPolicy._id);

          const pendingEmployees = allEmployees.filter(
            (emp) => !readEmployees.some((r) => r.employeeId === emp.id),
          );

          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  width: "520px",
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-content"
                  // samiksha p
                  ref={modalRef}
                  tabIndex="-1"
                >
                  {/* HEADER */}
                  <div
                    style={{
                      background: "#3A5FBE",
                      color: "#fff",
                      padding: "14px 18px",
                      fontWeight: 600,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    Policy Status – {statusPolicy.title}
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowStatusModal(false)}
                    >
                      ✕
                    </span>
                  </div>

                  {/* TABS */}
                  <div
                    style={{
                      display: "flex",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      onClick={() => setActiveTab("read")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        background:
                          activeTab === "read" ? "#e0e7ff" : "transparent",
                        fontWeight: 600,
                      }}
                    >
                      Read
                    </button>
                    <button
                      onClick={() => setActiveTab("pending")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        background:
                          activeTab === "pending" ? "#fde68a" : "transparent",
                        fontWeight: 600,
                      }}
                    >
                      Pending
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div
                    style={{
                      padding: "16px",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {activeTab === "read" && (
                      <>
                        {readEmployees.length === 0 ? (
                          <p>No employee has read this policy.</p>
                        ) : (
                          <table width="100%">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Date & Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {readEmployees.map((e) => {
                                const emp = allEmployees.find(
                                  (x) => x.id === e.employeeId,
                                );

                                return (
                                  <tr key={e.employeeId}>
                                    <td>{e.employeeId}</td>
                                    <td>{emp?.name || "-"}</td>
                                    <td>
                                      {new Date(
                                        e.acknowledgedAt,
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}

                    {activeTab === "pending" && (
                      <>
                        {pendingEmployees.length === 0 ? (
                          <p>All employees have read this policy.</p>
                        ) : (
                          <table width="100%">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingEmployees.map((e) => (
                                <tr key={e.id}>
                                  <td>{e.id}</td>
                                  <td>{e.name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default HrPolicy;
