import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function EmployeeMyLeave({ user, refreshKey }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Pagination state as React state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // <-- FIXED

  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [filteredLeaves, setFilteredLeaves] = useState([]); // For filtered results

  // aditya code
  const [selectedLeave, setSelectedLeave] = useState(null);

  // ✅ Pagination logic
  const modalRef = useRef(null);

  //TANVI
  useEffect(() => {
    if (!selectedLeave || !modalRef.current) return;

    const modal = modalRef.current;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    // ⭐ modal open होताच focus
    modal.focus();
    firstEl?.focus();

    const handleKeyDown = (e) => {
      // ESC key → modal close
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedLeave(null);
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
  }, [selectedLeave]);

  useEffect(() => {
    const isModalOpen = selectedLeave;

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
  }, [selectedLeave]);
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get(
          `https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/leave/my/${user._id}`,
        );

        console.log("raw leaves from API:", res.data);

        const leavesData = res.data.sort(
          (a, b) =>
            new Date(b.createdAt || b.appliedAt) -
            new Date(a.createdAt || a.appliedAt),
        );

        // small cache
        // const nameCache = {};
        // const getName = async (id) => {
        //   if (!id) return "N/A";
        //   if (nameCache[id]) return nameCache[id];
        //   try {
        //     const r = await axios.get(`https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/users/${id}`);
        //     nameCache[id] = r.data?.name || "N/A";
        //     return nameCache[id];
        //   } catch (e) {
        //     console.error("getName error for id", id, e);
        //     return "N/A";
        //   }
        // };
        const leavesWithNames = leavesData.map((leave) => ({
          ...leave,
          reportingManagerName: leave.reportingManager?.name || "N/A",
          approverName: leave.approvedBy?.name || "N/A",
          rejectedByName: leave.rejectedBy?.name || "N/A",
        }));
        setFilteredLeaves(leavesWithNames);

        console.log("leavesWithNames (first 5):", leavesWithNames.slice(0, 5));
        setLeaves(leavesWithNames);
      } catch (err) {
        console.error("Error fetching leaves:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [user, refreshKey]);

  useEffect(() => {
    setFilteredLeaves(leaves);
  }, [leaves]);

  //dipali code
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
const isStrictValidDate = (dateStr) => {
  if (!dateStr) return true; // allow empty

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateStr)) return false;

  const [year, month, day] = dateStr.split("-").map(Number);

  // Year range restriction (you can adjust)
  if (year < 1900 || year > 2100) return false;

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

 const applyFilters = () => {

  // ✅ 1. Validate From date
  if (!isStrictValidDate(dateFromFilter)) {
    alert("Invalid From date");
    return;
  }

  // ✅ 2. Validate To date
  if (!isStrictValidDate(dateToFilter)) {
    alert("Invalid To date");
    return;
  }

  // ✅ 3. Validate range
  if (dateFromFilter && dateToFilter && dateFromFilter > dateToFilter) {
    alert("Invalid date range");
    return;
  }

  const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
  const toDate = dateToFilter ? new Date(dateToFilter) : null;

  const filtered = leaves.filter((l) => {
    const statusMatch =
      statusFilter === "All" ||
      (l.status || "").toLowerCase() === statusFilter.toLowerCase();

    const leaveFrom = new Date(l.dateFrom);
    const leaveTo = new Date(l.dateTo);

    const fromMatch = !fromDate || leaveFrom >= fromDate;
    const toMatch = !toDate || leaveTo <= toDate;

    return statusMatch && fromMatch && toMatch;
  });

  setFilteredLeaves(filtered);
  setCurrentPage(1);
};



  const resetFilters = () => {
    setStatusFilter("All");
    setDateFromFilter("");
    setDateToFilter("");
    setFilteredLeaves(leaves);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // if (loading) return <p>Loading leaves...</p>;

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center mt-5"
        // style={{ minHeight: "100vh" }}
        style={{
          height: "100vh", // Changed from minHeight to height
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div
          className="spinner-grow"
          role="status"
          style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
          Loading ...
        </p>
      </div>
    );
  }

  if (leaves.length === 0) return <p>No leave applications found.</p>;

  const handleDelete = async (id) => {
    const leave = leaves.find((x) => x._id === id);
    if (!leave) return;

    // Only allow pending
    if (leave.status !== "pending") {
      alert("Only pending leaves can be deleted.");
      return;
    }

    const ok = window.confirm("Delete this pending leave?");
    if (!ok) return;

    setDeletingId(id);

    // Optimistic UI update
    const prevLeaves = leaves;
    setLeaves((ls) => ls.filter((x) => x._id !== id));

    try {
      const res = await fetch(`https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/leave/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        // rollback if server rejects
        setLeaves(prevLeaves);
        const data = await res.json().catch(() => ({}));
        // throw new Error(data?.error || "Failed to delete leave");
      }
      alert("Leave Request deleted Successfully!!")
      // success -> nothing else to do
    }
    catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="card mb-4 mt-3 shadow-sm border-0">
        <div className="card-body">
          <form
            className="row g-2 align-items-center"
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters();
            }}
          >
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1 ms-2">
              <label
                htmlFor="statusFilter"
                className="fw-bold mb-0 text-start text-md-end"
                style={{
                  fontSize: "16px",
                  color: "#3A5FBE",
                  width: "50px",
                  minWidth: "50px",
                }}
              >
                Status
              </label>
              <select
                id="statusFilter"
                className="form-select"
                style={{ minWidth: 100 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
              <label
                htmlFor="dateFromFilter"
                className="fw-bold mb-0 text-start text-md-end"
                style={{
                  fontSize: "16px",
                  color: "#3A5FBE",
                  width: "50px",
                  minWidth: "50px",
                  marginRight: "8px",
                }}
              >
                From
              </label>
              <input
                id="dateFromFilter"
                type="date"
                className="form-control"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                style={{ minWidth: "140px" }}
              />
            </div>
            <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
              <label
                htmlFor="dateToFilter"
                className="fw-bold mb-0 text-start text-md-end"
                style={{
                  width: "50px",
                  fontSize: "16px",
                  color: "#3A5FBE",
                  minWidth: "50px",
                  marginRight: "8px",
                }}
              >
                To
              </label>
              <input
                id="dateToFilter"
                type="date"
                className="form-control"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                style={{ minWidth: "140px" }}
              />
            </div>

            <div className="col-auto ms-auto d-flex gap-2">
              <button
                type="submit"
                style={{ minWidth: 90 }}
                className="btn btn-sm custom-outline-btn"
              >
                Filter
              </button>
              <button
                type="button"
                // className="btn btn-primary"
                style={{ minWidth: 90 }}
                className="btn btn-sm custom-outline-btn"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        className="table-responsive mt-3"
        style={{
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        {/* <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#f8f9fa" }}> */}
        <table className="table table-hover align-middle mb-0 bg-white">
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
                Leave Type
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
                Apply Date
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
                From
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
                To
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
                Duration
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
                Reason for Leave
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
                Approved By
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
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentLeaves.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4"
                  style={{ color: "#6c757d" }}
                >
                  No leaves requests found.
                </td>
              </tr>
            ) : (
              currentLeaves.map((l) => (
                <tr
                  key={l._id}
                  onClick={() => setSelectedLeave(l)}
                  style={{ cursor: "pointer" }}
                >
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.leaveType}
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
                    {new Date(l.appliedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
                    {new Date(l.dateFrom).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
                    {new Date(l.dateTo).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
                    {l.duration === "half"
                      ? 0.5
                      : Math.floor(
                        (new Date(l.dateTo) - new Date(l.dateFrom)) /
                        (1000 * 60 * 60 * 24),
                      ) + 1}
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
                    {l.status === "approved" ? (
                      <span
                        style={{
                          backgroundColor: "#d1f2dd",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "500",
                          display: "inline-block",
                          width: "100px",
                          textAlign: "center",
                        }}
                      >
                        Approved
                      </span>
                    ) : l.status === "rejected" ? (
                      <span
                        style={{
                          backgroundColor: "#f8d7da",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "500",
                          display: "inline-block",
                          width: "100px",
                          textAlign: "center",
                        }}
                      >
                        Rejected
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: "#FFE493",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "500",
                          display: "inline-block",
                          width: "100px",
                          textAlign: "center",
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      maxWidth: "220px",
                      wordBreak: "break-word",
                      overflow: "auto",
                    }}
                  >
                    {l.reason}
                  </td>
                  {/* //Added by Rutuja */}
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "middle",
                      fontSize: "14px",
                      borderBottom: "1px solid #dee2e6",
                      whiteSpace: "nowrap",
                      textTransform: "capitalize",
                    }}
                  >
                    {l.status === "pending"
                      ? (l.reportingManager?.name || "N/A")
                      : l.status === "approved"
                        ? (l.approvedBy?.name || l.reportingManager?.name || "N/A")
                        : l.status === "rejected"
                          ? (l.rejectedBy?.name || l.approvedBy?.name || l.reportingManager?.name || "N/A")
                          : "N/A"
                    }
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
                    {l.status === "pending" ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(l._id);
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      //jaicy
                      <div>
                        <span style={{ fontSize: "13px" }}>-</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* select table model box */}

      {selectedLeave && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          ref={modalRef}
          tabIndex="-1"
        >
          <div
            className="modal-dialog"
            style={{
              maxWidth: "650px",
              width: "95%",
              marginTop: "160px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {" "}
            <div className="modal-content">
              {/* Header */}
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">Leave Request Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedLeave(null)}
                />
              </div>

              {/* Body */}
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold">Leave Type</div>
                    <div className="col-sm-9 col-7">
                      {selectedLeave.leaveType}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold">Date From</div>
                    <div className="col-sm-9 col-7">
                      {new Date(selectedLeave.dateFrom).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold">Date To</div>
                    <div className="col-sm-9 col-7">
                      {new Date(selectedLeave.dateTo).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>

                  {/* Duration change in popup by dip 11-02-2026 */}
                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold">Duration</div>
                     <div className="col-sm-9 col-7">
                    {selectedLeave.duration === "half"
                      ? "0.5 day"
                      : (() => {
                          const days =
                            Math.floor(
                              (new Date(selectedLeave.dateTo) -
                                new Date(selectedLeave.dateFrom)) /
                                (1000 * 60 * 60 * 24)
                            ) + 1;

                          return `${days} ${days === 1 ? "day" : "days"}`;
                        })()}
                  </div>
                  </div>

                  {/* <div className="row mb-2"> */}
                    {/* <div className="col-5 col-sm-3 fw-semibold">
                      Approved Byt
                    </div> */}
                    {selectedLeave.status !== "pending" && (
                      <div className="row mb-2">
                        <div className="col-5 col-sm-3 fw-semibold">
                          {selectedLeave.status === "approved" ? "Approved by" :
                            selectedLeave.status === "rejected" ? "Rejected by" :
                              ""}
                        </div>
                        <div className="col-sm-9 col-5">
                          {selectedLeave.status === "approved"
                            ? (selectedLeave.approvedBy?.name || "N/A")
                            : selectedLeave.status === "rejected"
                              ? (selectedLeave.rejectedBy?.name || selectedLeave.approvedBy?.name || "N/A")
                              : "N/A"
                          }
                          {selectedLeave.status === "approved" && selectedLeave.approvedBy?.role &&
                            ` (${selectedLeave.approvedBy.role})`
                          }
                        </div>
                      </div>
                    )}
                  {/* </div> */}

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold">Reason</div>
                    <div
                      className="col-sm-9 col-7"
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {selectedLeave.reason || "-"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold">Status</div>
                    <div className="col-sm-9 col-7">
                      <span
                        className={
                          "badge text-capitalize " +
                          (selectedLeave.status === "approved"
                            ? "bg-success"
                            : selectedLeave.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark")
                        }
                      >
                        {selectedLeave.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 pt-0">
                {selectedLeave.status === "pending" && (
                  <button
                    className="btn btn-outline-danger me-2"
                    onClick={() => {
                      handleDelete(selectedLeave._id);
                      setSelectedLeave(null); // close modal after delete
                    }}
                  >
                    Delete
                  </button>
                )}

                <button
                  className="btn  custom-outline-btn"
                  onClick={() => setSelectedLeave(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Pagination controls */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          {/* Rows per page dropdown */}
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "14px", marginRight: "8px" }}>
              Rows per page:
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto", fontSize: "14px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Page range display */}
          <span style={{ fontSize: "14px", marginLeft: "16px" }}>
            {filteredLeaves.length === 0
              ? "0–0 of 0"
              : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredLeaves.length)} of ${filteredLeaves.length}`}
          </span>

          {/* Navigation arrows */}
          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "16px" }}
          >
            <button
               className="btn btn-sm focus-ring"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ fontSize: "18px", padding: "2px 8px" }}
            >
              ‹
            </button>
            <button
               className="btn btn-sm focus-ring"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ fontSize: "18px", padding: "2px 8px" }}
            >
              ›
            </button>
          </div>
        </div>
      </nav>

      <div className="text-end mt-3">
        <button
          style={{ minWidth: 90 }}
          className="btn btn-sm custom-outline-btn"
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default EmployeeMyLeave;
