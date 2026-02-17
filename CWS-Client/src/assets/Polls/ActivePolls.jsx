import axios from "axios";
import React, { useState, useEffect, useRef } from "react";

const ActivePolls = ({ user }) => {

const [showCreatePoll, setShowCreatePoll] = useState(false);
const [pollQuestion, setPollQuestion] = useState("");
const [pollDescription, setPollDescription] = useState("");
const [options, setOptions] = useState(["", ""]);
const [savedPolls, setSavedPolls] = useState([]);
const [popupPreviousPolls, setPopupPreviousPolls] = useState(null);
const [previousPolls, setPreviousPolls] = useState([]);
const [voteMessage, setVoteMessage] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const modalRef = useRef(null);

useEffect(() => {
const fetchActivePoll = async () => {
  setLoading(true);           
  setError(null);
  try {
    const res = await axios.get("https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/polls/active");
    if (res.data) {
    setSavedPolls([res.data]);
  }
  } catch (err) {
    setError("Failed to load active polls");
    } finally {
       setLoading(false);       
  }
};

fetchActivePoll();
}, []);

useEffect(() => {
const isModalOpen = popupPreviousPolls || showCreatePoll; 

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
}, [popupPreviousPolls, showCreatePoll]);



const isAnyModalOpen = popupPreviousPolls || showCreatePoll;

useEffect(() => {

if (!isAnyModalOpen || !modalRef.current) return;

const modal = modalRef.current;

const focusableElements = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);

if (!focusableElements.length) return;

const firstEl = focusableElements[0];
const lastEl = focusableElements[focusableElements.length - 1];


modal.focus();


const handleKeyDown = (e) => {

  if (e.key === "Escape") {
    e.preventDefault();
    setPopupPreviousPolls(false);
    setShowCreatePoll(false);
}

// TAB key → focus trap
if (e.key === "Tab") {
  if (e.shiftKey) {
    if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } 
    else {
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

useEffect(() => {
  const fetchPreviousPolls = async () => {
    try {
      const res = await axios.get("https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/polls/previous");
      setPreviousPolls(res.data);
      } catch (err) {
        console.error(err);
    }
  };
fetchPreviousPolls();
}, []);

// ========== Admin Poll Functions ==========
const addOption = () => setOptions([...options, ""]);
const updateOption = (index, value) => {
  const updated = [...options];
  updated[index] = value;
  setOptions(updated);
};
const removeOption = (index) => {
  if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
};
const countWords = (text) => {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
};

const createPoll = async () => {
  if (!pollQuestion.trim() || options.some((o) => !o.trim())) {
    alert("Please enter a question and fill all options");
    return;
  }

  try {
  const token = localStorage.getItem("accessToken");
  const res = await axios.post(
    "https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/polls/create",
    {  question: pollQuestion,
      description: pollDescription,
      options: options.map(opt => ({ text: opt }))
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const activeRes = await axios.get(
    "https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/polls/active"
  );

  setSavedPolls(activeRes.data ? [activeRes.data] : []);   
  setPollQuestion("");
  setPollDescription("");
  setOptions(["", ""]);
  setShowCreatePoll(false);

  } catch (err) {
    console.error(err);
  }
  };

// ========== Employee Poll Functions ==========
const [voting, setVoting] = useState(false);
const storedUser = (() => {
try {
  const employee = localStorage.getItem("employee");
  const userData = localStorage.getItem("user");
  return employee ? JSON.parse(employee) : userData ? JSON.parse(userData) : null;
} catch (err) {
  console.error("Error parsing localStorage user", err);
  return null;
}
})();

const loggedInUserId = user?._id ?? storedUser?._id ?? null;

console.log("Logged in userId →", loggedInUserId);

const votePoll = async (pollId, optionIndex) => {
  if (voting) return;

  if (!loggedInUserId) {
    setVoteMessage("User not logged in");
    return;
  }

  setVoting(true);

  try {
  const token = localStorage.getItem("accessToken");


  const res = await axios.post(
  "https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api/polls/vote",
  { pollId, optionIndex, userId: loggedInUserId },
  { headers: { Authorization: `Bearer ${token}` } }

  );
  setVoteMessage(""); 

  setSavedPolls(prev =>
    prev.map(p =>
      p?._id?.toString() === res.data?._id?.toString()
      ? res.data
      : p
    )
  );

// 2️⃣ Previous polls modal update करा
setPreviousPolls(prev =>
  prev.map(p =>
    p?._id?.toString() === res.data?._id?.toString()
    ? res.data
    : p
  )
);


} catch (err) {
  if (err.response?.status === 400) {
   setVoteMessage(err.response.data.message || "You already voted");

  setTimeout(() => {
  setVoteMessage("");
  }, 3000);
  } else {
    setVoteMessage("Voting failed");
  }
}
  finally {
    setVoting(false);
  }
};

return (
    <div
    className="card shadow-sm h-100 border-0"
    style={{ borderRadius: "10px" }}
    >
      <div
      className="card-header d-flex justify-content-between align-items-center"
      style={{ backgroundColor: "#fff", borderRadius: "12px 12px 0 0", gap: "0.5rem" }}
      >
        <h6 className="mb-0" style={{ color: "#3A5FBE" }}>
        Active Polls
        </h6>

      {/* Only show create button to admin */}
      {user?.role === "admin" && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
            onClick={() => setShowCreatePoll(true)}
          >
            Create Poll
          </button>

          <button
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
            onClick={() => setPopupPreviousPolls(true)}
          >
            View All Polls
          </button>
        </div>
      )
      }
    </div>




    <div className="card-body">
      {loading && <p>Loading polls...</p>}
      {error && <p className="text-danger">{error}</p>}
      {/* Active Poll (visible to all) */}
      {!loading && !error && savedPolls.length > 0 && (
        <div>
          {savedPolls.length > 0 && (

            <div>
              {savedPolls.map((poll) => {

              const userVote = poll?.votedUsers?.find(
              v => v.userId?.toString() === loggedInUserId?.toString()
              );

              return(

                <div key={poll._id} >

                <p className="fw-semibold">{poll.question}</p>

                  {poll.options?.map((opt, idx) => {


                  const votesCount = opt.votes || 0;

                  return (
                    <div key={idx} className="mb-2">
                      <label className="d-flex justify-content-between align-items-center">
                        <div>
                          <input
                            type="radio"
                            name={`poll-${poll._id}`}
                            className="me-2"
                            checked={userVote?.optionIndex === idx}
                            disabled={voting || !!userVote}
                            onChange={() => votePoll(poll._id, idx)}
                          />
                        {opt.text}
                        </div>
                        <span className="badge bg-secondary">
                          {votesCount} votes
                          {/* {user?.role === "admin" && ` (${percentage}%)`} */}
                        </span>
                      </label>
                    </div>
                  );
                })}

                {voteMessage && (
                  <div className="alert alert-warning py-1 mt-2">
                  {voteMessage}
                  </div>
                )}
                {poll.description && <p className="text-muted mt-2">{poll.description}</p>}
              </div>
            )})}
          </div>
        )}
      </div>
      )}
    </div>

      {user?.role === "admin" && showCreatePoll && (
        <div
          className="modal fade show"
          ref={modalRef}
          tabIndex="-1"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
          if (e.target === e.currentTarget) setShowCreatePoll(false); // click outside closes modal
          }}
          >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
            {/* HEADER */}
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
                >
                <h5 className="modal-title mb-0">Create New Poll</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreatePoll(false)}
                />
              </div>

            {/* BODY */}
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Enter poll question"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
                {options.map((opt, index) => (
                  <div key={index} className="d-flex mb-2">
                    <input type="radio" disabled className="me-2 mt-2" />
                    <input
                      className="form-control me-2"
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <button
                        className="btn btn-sm custom-outline-btn"
                        onClick={() => removeOption(index)}
                      >
                      Remove
                      </button>
                    )}
                  </div>
                ))}

                  <button
                      className="btn btn-sm custom-outline-btn mb-2"
                      onClick={addOption}
                    >
                    + Add Option
                  </button>

{/* <input
                    className="form-control mb-3"
                    placeholder="Enter poll description"
                    value={pollDescription}
                    onChange={(e) => setPollDescription(e.target.value)}
                  /> */}

                  <input
  className="form-control mb-3"
  placeholder="Enter poll description (max 300 words)"
  value={pollDescription}
  onChange={(e) => {
    const value = e.target.value;
    if (countWords(value) <= 300) {
      setPollDescription(value);
    }
  }}
  
/>


                {/* Save & Cancel buttons aligned right */}
                <div className="d-flex justify-content-end gap-2 flex-wrap">
                  <button
                    className="btn btn-sm custom-outline-btn"
                    style={{ minWidth: 90 }}
                    onClick={createPoll}
                    >
                    Save Poll
                  </button>
                  <button
                      className="btn btn-sm custom-outline-btn"
                      style={{ minWidth: 90 }}
                      onClick={() => {
                        setShowCreatePoll(false);
                        setPollQuestion("");
                        setPollDescription("");
                        setOptions(["", ""]);
                      }}
                    >
                  Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    {popupPreviousPolls && (
      <div
          className="modal fade show"
          ref={modalRef}
          tabIndex="-1"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setPopupPreviousPolls(null)}
        >
          <div className="modal-dialog">
            <div className="modal-content">
            {/* HEADER */}
              <div className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
                >
                <h5 className="modal-title mb-0">
                Previous Polls Details
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setPopupPreviousPolls(null)}
                />
              </div>

              {/* BODY */}
              <div className="modal-body">
                {previousPolls.length > 0 ? (
                  previousPolls.map((poll) => (
                    <div key={poll._id} className="border rounded p-3 mb-3">
                      <p className="fw-semibold">{poll.question}</p>

                      {poll.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="d-flex justify-content-between mb-1"
                          >
                            <span>{opt.text}</span>
                            <span className="badge bg-secondary">
                            {opt.votes} votes
                            </span>
                        </div>
                        ))}
                      </div>
                    ))
                  ) : (
                  <p className="text-muted text-center">
                  No previous polls found
                  </p>
                )}
              </div>
            </div>
          </div>
      </div>
    )}
  </div>
  );
};

export default ActivePolls;