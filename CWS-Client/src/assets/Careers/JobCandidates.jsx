import React, { useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import axios from "axios";

function JobCandidates({ user }) {

  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [openStatusId, setOpenStatusId] = useState(null);
  const userRole = user?.role || localStorage.getItem("role");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
const [dateFilter, setDateFilter] = useState("");
     // filtered list
const [allApplicants, setAllApplicants] = useState([]); 
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(5);
const navigate = useNavigate();
const { role, username, id } = useParams();
const [rowViewCandidate, setRowViewCandidate] = useState(null); // row click popup
const [editCandidate, setEditCandidate] = useState(null);       // view/edit popup
const [tempStatus, setTempStatus] = useState("");

const applyFilters = () => {
  let temp = [...allApplicants];

  if (searchTerm) {
    temp = temp.filter(app =>
      app?.candidate?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }

  if (dateFilter) {
    const selected = new Date(dateFilter).toDateString();
    temp = temp.filter(app =>
      new Date(app.createdAt).toDateString() === selected
    );
  }

  setApplicants(temp);
};
const resetFilters = () => {
  setSearchTerm("");
  setDateFilter("");
  setApplicants(allApplicants); 
};

useEffect(() => {
  fetch(`https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/apply/job/${jobId}`)
    .then(res => res.json())
    .then(data => {
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.applicants)
        ? data.applicants
        : [];

      setApplicants(list);
      setAllApplicants(list);  
    });
}, [jobId]);


async function handleStatusChange(applicationId, newStatus) {
  await axios.put(`https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/apply/${applicationId}`, {
    status: newStatus,
  });

  setApplicants((prev) =>
    prev.map((app) =>
      app._id === applicationId ? { ...app, status: newStatus } : app
    )
  );
}

// PAGINATION LOGIC
const totalPages = Math.ceil(applicants.length / rowsPerPage);

const indexOfLastItem = currentPage * rowsPerPage;
const indexOfFirstItem = indexOfLastItem - rowsPerPage;

const currentApplicants = applicants.slice(
  indexOfFirstItem,
  indexOfLastItem
);

const handlePageChange = (page) => {
  if (page < 1 || page > totalPages) return;
  setCurrentPage(page);
};

const getStatusColor = (status) => {
  const baseStyle = {
    padding: "6px 14px",
    borderRadius: "8px",    
    fontWeight: "500",
    letterSpacing: "0.3px",
    display: "inline-block",
    lineHeight: "1",
    minWidth: "90px",
    textAlign: "center",
  };

  switch (status) {
    case "Shortlisted":
      return {
        ...baseStyle,
        backgroundColor: "#cfe2ff",
      };

    case "Hired":
    case "Approved":
      return {
        ...baseStyle,
        backgroundColor: "#b7e4c7", 
        color: "#000",
      };

    case "Rejected":
      return {
        ...baseStyle,
        backgroundColor: "#f5c2c7", 
        color: "#000",
      };

    default:
      return {
        ...baseStyle,
        backgroundColor: "#dee2e6",
        color: "#000",
      };
  }
};

  return (
    <div className="container-fluid ">
      <div className="d-flex justify-content-between mb-3">
      <h4 style={{ color: "#3A5FBE",fontSize:"25px" }}>Candidates</h4>
</div>

<div className="card mb-4 shadow-sm border-0">
  <div className="card-body">
    <form
      className="row g-2 align-items-center"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
      style={{ justifyContent: "space-between" }}
    >
      

     
      <div className="col-12 col-md-auto d-flex align-items-center gap-2 ms-2">
        <label
          className="fw-bold mb-0"
          style={{
            fontSize: "16px",
            color: "#3A5FBE",
            width: "50px",
          }}
        >
          Search
        </label>

        <input
          type="text"
          className="form-control"
          placeholder="Search candidate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

     
       <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2 gap-2">
        <label
          className="fw-bold mb-0"
          style={{
            fontSize: "16px",
            color: "#3A5FBE",
            width: "50px",
            marginRight: "8px",
          }}
        >
          Date
        </label>

        <input
          type="date"
          className="form-control"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
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
       <div className="card shadow-sm border-0">
              <div className="table-responsive bg-white">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: "#ffffffff" }}>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                 <th>Referred By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

           <tbody>
  {applicants.length === 0 ? (
    <tr>
      <td colSpan="5">No applicants found</td>
    </tr>
  ) : (
    currentApplicants.map((app) => (
      <tr key={app._id} 
        onClick={() => setRowViewCandidate(app)}
>
        <td>{app?.candidate?.name}</td>
        <td>{app?.candidate?.email}</td>
        <td>{app?.candidate?.phone}</td>
        <td>{app?.candidate?.experience} yrs</td>
        <td>
  {app?.referredBy?.name ? app.referredBy.name : "-"}
</td>
       

    <td>
  
   <span style={getStatusColor(app.status)}>
  {app.status || "Applied"}
</span>


</td>
<td>
  <button
    className="btn btn-sm custom-outline-btn"
    style={{ minWidth: 90 }}
    onClick={(e) => {
      e.stopPropagation();
      setSelectedCandidate(app);
      setTempStatus(app.status || "Applied");
    }}
  >
    View
  </button>
</td>
      </tr>
    ))
  )}
</tbody> 

          </table>
          
{selectedCandidate && (
  <div
    className="modal fade show"
    style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
  >
     <div className="modal-dialog modal-lg modal-dialog-centered"
  style={{ maxWidth: "600px", marginTop: "80px" }}
>
      <div className="modal-content">

       
        <div
          className="modal-header text-white"
          style={{ backgroundColor: "#3A5FBE" }}
        >
          <h5 className="modal-title mb-0">
            {selectedCandidate?.candidate?.name}
          </h5>

          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setSelectedCandidate(null)}
          />
        </div>

      
        <div className="modal-body">

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Email</div>
            <div className="col-8">
              {selectedCandidate?.candidate?.email}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Phone</div>
            <div className="col-8">
              {selectedCandidate?.candidate?.phone}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Experience</div>
            <div className="col-8">
              {selectedCandidate?.candidate?.experience} Years
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Current Location</div>
            <div className="col-8">
              {selectedCandidate?.candidate?.city}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Applied Date</div>
            <div className="col-8">
              {new Date(selectedCandidate?.createdAt).toLocaleDateString()}
            </div>
          </div>

          {selectedCandidate?.referredBy && (
            <div className="row mb-2">
              <div className="col-4 fw-semibold">Referred By</div>
              <div className="col-8">
                {selectedCandidate?.referredBy?.name}
              </div>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-4 fw-semibold">Resume</div>
            <div className="col-8">
              {selectedCandidate?.candidate?.resumeUrl ? (
                <>
                  <a
                    href={selectedCandidate.candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>{" "}
                  |{" "}
                  <a
                    href={selectedCandidate.candidate.resumeUrl}
                    download
                  >
                    Download
                  </a>
                </>
              ) : (
                "Not uploaded"
              )}
            </div>
          </div>

         
          <div className="row align-items-center">
            <div className="col-4 fw-semibold">Status</div>
            <div className="col-8 ">
              {["hr", "admin"].includes(userRole) && (
             <select
  className="form-select"
  value={tempStatus}
  onChange={(e) => setTempStatus(e.target.value)}
>
  <option>Applied</option>
  <option>Shortlisted</option>
  <option>Interview</option>
  <option>Hired</option>
  <option>Rejected</option>
</select>
              )}
            </div>
          </div>

        </div>

      
        <div className="modal-footer">
 <button
  className="btn btn-sm custom-outline-btn"
  style={{ minWidth: 90 }}
  onClick={async () => {

    if (!selectedCandidate) return;
    alert("Save Changes Succesfully");

    await handleStatusChange(selectedCandidate._id, tempStatus);

    setApplicants(prev =>
      prev.map(app =>
        app._id === selectedCandidate._id
          ? { ...app, status: tempStatus }
          : app
      )
    );

    setSelectedCandidate(null);
  }}
>
  Save Changes
</button>
          <button
            className="btn btn-sm custom-outline-btn"
            onClick={() => setSelectedCandidate(null)}
            style={{minWidth:90}}
          >
            Close
          </button>
        </div>

      </div>
      
    </div>
    
  </div>
)}
{rowViewCandidate && (
  <div
    className="modal fade show"
    style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
  >
    <div  className="modal-dialog modal-lg modal-dialog-centered"
  style={{ maxWidth: "600px", marginTop: "80px" }}
>
      <div className="modal-content">

         <div
          className="modal-header text-white"
          style={{ backgroundColor: "#3A5FBE" }}
        >
          <h5>{rowViewCandidate?.candidate?.name}</h5>
           <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setRowViewCandidate(null)}
          />
        </div>

        <div className="modal-body">

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Email</div>
            <div className="col-8">
              {rowViewCandidate?.candidate?.email || "-"}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Phone</div>
            <div className="col-8">
              {rowViewCandidate?.candidate?.phone || "-"}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Experience</div>
            <div className="col-8">
              {rowViewCandidate?.candidate?.experience
                ? `${rowViewCandidate.candidate.experience} Years`
                : "-"}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Current Location</div>
            <div className="col-8">
              {rowViewCandidate?.candidate?.city || "-"}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Applied Date</div>
            <div className="col-8">
              {rowViewCandidate?.createdAt
                ? new Date(rowViewCandidate.createdAt).toLocaleDateString()
                : "-"}
            </div>
          </div>

          {rowViewCandidate?.referredBy?.name && (
            <div className="row mb-2">
              <div className="col-4 fw-semibold">Referred By</div>
              <div className="col-8">
                {rowViewCandidate.referredBy.name}
              </div>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-4 fw-semibold">Resume</div>
            <div className="col-8">
              {rowViewCandidate?.candidate?.resumeUrl ? (
                <>
                  <a
                    href={rowViewCandidate.candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>{" "}
                  |{" "}
                  <a
                    href={rowViewCandidate.candidate.resumeUrl}
                    download
                  >
                    Download
                  </a>
                </>
              ) : (
                "Not uploaded"
              )}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-4 fw-semibold">Status</div>
            <div className="col-8">
              <span style={getStatusColor(rowViewCandidate?.status)}>
                {rowViewCandidate?.status || "Applied"}
              </span>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button
            className="btn btn-sm custom-outline-btn"
            onClick={() => setRowViewCandidate(null)}
            style={{minWidth:90}}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
)}
        </div>
        
      </div>
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
  <div className="d-flex align-items-center gap-3">

   
    <div className="d-flex align-items-center">
      <span style={{ fontSize: "14px", marginRight: "8px" }}>
        Rows per page:
      </span>

      <select
        className="form-select form-select-sm"
        style={{ width: "auto" }}
        value={rowsPerPage}
        onChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
      </select>
    </div>


    <span style={{ fontSize: "14px" }}>
      {applicants.length === 0
        ? "0–0 of 0"
        : `${indexOfFirstItem + 1}-${Math.min(
            indexOfLastItem,
            applicants.length
          )} of ${applicants.length}`}
    </span>

   
    <div className="d-flex align-items-center">
      <button
        className="btn btn-sm focus-ring"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      <button
        className="btn btn-sm focus-ring"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  </div>
</nav>
 <div className="text-end mt-3">
<button
  className="btn btn-sm custom-outline-btn"
  style={{minWidth:90}}
  onClick={() =>
    navigate(`/dashboard/${role}/${username}/${id}/careers`)
  }
>
  Back
</button>
</div>
    </div>
    
    
  );
}

export default JobCandidates;