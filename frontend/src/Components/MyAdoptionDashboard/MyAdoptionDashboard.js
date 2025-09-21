import React, { useState, useEffect } from "react";
// At the top of MyAdoptionDashboard.js
import { useNavigate , useLocation} from "react-router-dom";
import axios from "axios";
import {
  FaPaw,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaDownload,
  FaTrash,
  FaBell,
  FaCheck,
  FaFilter,
  FaChevronDown,
  FaTimes,
  FaEye,
  FaFile,
} from "react-icons/fa";

import "./MyAdoptionDashboard.css";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {  FaFileWord, FaFileExcel } from "react-icons/fa";
import { Clipboard, BellRing, Dog, PawPrint, ShieldCheck } from "lucide-react";


function MyAdoptionDashboard() {
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [followupSummaries, setFollowupSummaries] = useState({}); // { [requestId]: { completed, totalRequired, nextDueWeek } }
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notifications, setNotifications] = useState([]);
const [activeTab, setActiveTab] = useState("requests");
const location = useLocation();









  const [isEditing, setIsEditing] = useState(false);
  const [adopterForm, setAdopterForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    adopterStatus: "",
    homeType: "",
    hasPets: false,
    agree: false,
  });

  // Sync adopterForm when a request is selected
  useEffect(() => {
    if (selectedRequest) {


      
      setAdopterForm({
        name: selectedRequest.adopter.name,
        email: selectedRequest.adopter.email,
        phone: selectedRequest.adopter.phone,
        address: selectedRequest.adopter.address,
        adopterStatus: selectedRequest.adopterStatus,
        homeType: selectedRequest.homeType,
        hasPets: selectedRequest.hasPets,
        agree: selectedRequest.agree,
      });
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch adoption requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Fetch only the current user's adoption requests
        const res = await axios.get("/adoption-requests/mine");

        const formattedRequests = res.data.map((r) => ({
          id: r._id,
          dog: {
            ...r.dog,
            photo: r.dog?.photo
              ? `http://localhost:3000/uploads/dogs/${r.dog.photo}`
              : "/placeholder.jpg",
          },
          adopter: {
            
            name: r.fullName,
            email: r.email,
            phone: r.phone,
            address: r.address,
            _id: r._id, // Use request ID or any unique value for now
          },
          adopterStatus: r.status,
          homeType: r.homeType,
          hasPets: r.hasPets,
          agree: r.agree,
          status: r.requestStatus.charAt(0).toUpperCase() + r.requestStatus.slice(1),
          vetClearance: (r.vetReviewStatus || 'pending').charAt(0).toUpperCase() + (r.vetReviewStatus || 'pending').slice(1),
          date: new Date(r.createdAt).toLocaleDateString(),
        }));

  setRequests(formattedRequests);
        

        const notes = formattedRequests
          .map((r) => {
            if (r.status === "Pending")
              return ` ${r.dog.name}’s request is pending vet clearance.`;
            if (r.status === "Approved")
              return `✅ ${r.dog.name}’s adoption is approved. Certificate ready!`;
            if (r.status === "Rejected")
              return `❌ ${r.dog.name}’s adoption request was rejected.`;
            return null;
          })
          .filter(Boolean);

        setNotifications(notes);

        // Fetch follow-up summaries for approved requests
        const approved = formattedRequests.filter(r => r.status === "Approved");
        if (approved.length) {
          const token = localStorage.getItem('authToken');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const promises = approved.map(r => axios.get(`/follow-up-reports/${r.id}/summary`, { headers }).then(res => ({ id: r.id, summary: res.data })).catch(() => ({ id: r.id, summary: { completed: 0, totalRequired: 4, nextDueWeek: 1 } })));
          Promise.all(promises).then(results => {
            const map = {};
            results.forEach(({ id, summary }) => { map[id] = summary; });
            setFollowupSummaries(map);
          });
        }
      } catch (err) {
        console.error("Error fetching adoption requests:", err);
      }
    };

    fetchRequests();

    const handleNewRequest = () => fetchRequests();
    window.addEventListener("adoptionRequestSubmitted", handleNewRequest);
    return () =>
      window.removeEventListener("adoptionRequestSubmitted", handleNewRequest);
  }, []);

  // Handle form input changes
  const handleAdopterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdopterForm({
      ...adopterForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Save edited adopter info
  const handleSaveAdopter = async () => {
    try {
  await axios.put(
  `/adoption-requests/${selectedRequest.id}`,
        {
          fullName: adopterForm.name,
          email: adopterForm.email,
          phone: adopterForm.phone,
          address: adopterForm.address,
          status: adopterForm.adopterStatus,
          homeType: adopterForm.homeType,
          hasPets: adopterForm.hasPets,
          agree: adopterForm.agree,
        }
      );

      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                adopter: { ...adopterForm },
                adopterStatus: adopterForm.adopterStatus,
                homeType: adopterForm.homeType,
                hasPets: adopterForm.hasPets,
                agree: adopterForm.agree,
              }
            : req
        )
      );

      setSelectedRequest((prev) => ({
        ...prev,
        adopter: { ...adopterForm },
        adopterStatus: adopterForm.adopterStatus,
        homeType: adopterForm.homeType,
        hasPets: adopterForm.hasPets,
        agree: adopterForm.agree,
      }));

      setIsEditing(false);
      alert("Adopter info updated successfully!");
    } catch (err) {
      console.error("Error updating adopter info:", err);
      alert("Failed to update adopter info.");
    }
  };

  // Delete request
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
  await axios.delete(`/adoption-requests/${id}`);
        setRequests(requests.filter((req) => req.id !== id));
      } catch (err) {
        console.error("Error deleting request:", err);
        alert("Failed to delete request.");
      }
    }
  };

  // Download certificate
  const handleDownloadPDF = (req) => {
    if (!req) return;
    const doc = new jsPDF();
    doc.text(`Adoption Certificate for ${req.dog.name}`, 10, 10);
    doc.text(`Adopter: ${req.adopter.name}`, 10, 20);
    doc.text(`Adoption Date: ${req.date}`, 10, 30);
    doc.save(`Certificate_${req.dog.name}.pdf`);
  };

const handleDownloadWord = (req) => {
    if (!req) return;
    const blob = new Blob(
      [
        `Adoption Certificate\n\nDog: ${req.dog.name}\nAdopter: ${req.adopter.name}\nAdoption Date: ${req.date}`,
      ],
      { type: "application/msword" }
    );
    saveAs(blob, `Certificate_${req.dog.name}.doc`);
  };

const handleDownloadExcel = (req) => {
    if (!req) return;
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Dog: req.dog.name,
        Adopter: req.adopter.name,
        "Adoption Date": req.date,
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificate");
    XLSX.writeFile(workbook, `Certificate_${req.dog.name}.xlsx`);
  };






  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status.toLowerCase() === filter.toLowerCase());

  const metrics = {
    pending: requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };



  return (
    <div className="my-ad-dashboard">
      {/* Hero Section */}
      <div className="my-ad-dashboard-hero">
        <h1> <Dog size={100} /> My Adoption Dashboard</h1>
        <p>Track your adoption requests, certificates & journey with us</p>
        <button
          className="my-ad-btn primary"
          onClick={() => (window.location.href = "/adoptdogspage")}
        >
          + New Adoption Request
        </button>

 </div>

      {/* ===== Dashboard Tabs ===== */}
<div className="ad-d-dashboard-tabs">
  <button
    className={activeTab === "requests" ? "tab-active" : ""}
    onClick={() => setActiveTab("requests")}
  >
    <FaPaw size={18} /> My Requests
  </button>
  {/* <button
    className={activeTab === "certificates" ? "tab-active" : ""}
    onClick={() => setActiveTab("certificates")}
  >
    <ShieldCheck size={18} /> Certificates
  </button> */}
  <button
    className={activeTab === "notifications" ? "tab-active" : ""}
    onClick={() => setActiveTab("notifications")}
  >
    <BellRing size={18} /> Notifications
  </button>
  <button
    className={activeTab === "followup" ? "tab-active" : ""}
    onClick={() => setActiveTab("followup")}
  >
    <Clipboard size={18} />  Follow-Ups
  </button>
</div>


{/* Filters */}
{activeTab === "requests" && (
  <>
    {/* Enhanced Metrics */}
    <div className="my-ad-metrics-enhanced">
      <div className="my-ad-metric-card-enhanced pending">
        <div className="metric-icon">
          <FaHourglassHalf />
        </div>
        <div className="metric-content">
          <span className="metric-value">{metrics.pending}</span>
          <span className="metric-label">Pending Requests</span>
        </div>
      </div>
      
      <div className="my-ad-metric-card-enhanced approved">
        <div className="metric-icon">
          <FaCheckCircle />
        </div>
        <div className="metric-content">
          <span className="metric-value">{metrics.approved}</span>
          <span className="metric-label">Approved</span>
        </div>
      </div>
      
      <div className="my-ad-metric-card-enhanced rejected">
        <div className="metric-icon">
          <FaTimesCircle />
        </div>
        <div className="metric-content">
          <span className="metric-value">{metrics.rejected}</span>
          <span className="metric-label">Rejected</span>
        </div>
      </div>
      
      <div className="my-ad-metric-card-enhanced total">
        <div className="metric-icon">
          <FaPaw />
        </div>
        <div className="metric-content">
          <span className="metric-value">{requests.length}</span>
          <span className="metric-label">Total Requests</span>
        </div>
      </div>
    </div>
    
    {/* Enhanced Filters */}
<div className="my-ad-filters-enhanced">
  <div className="filter-header">
    <div className="filter-title">
      <FaFilter className="filter-icon" />
      <h3>Filter Requests</h3>
    </div>
    <span className="filter-results">Showing {filteredRequests.length} of {requests.length} requests</span>
  </div>
  
  <div className="filter-controls">
    {/* Custom Dropdown Filter */}
    <div className="custom-filter-dropdown">
      <div className="dropdown-trigger" onClick={() => document.querySelector('.dropdown-options').classList.toggle('show')}>
        <span className="dropdown-label">Status: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
        <FaChevronDown className="dropdown-arrow" />
      </div>
      
      <div className="dropdown-options">
        <div 
          className={`dropdown-option ${filter === 'all' ? 'selected' : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className="option-content">
            <div className="option-check">
              {filter === 'all' && <FaCheck />}
            </div>
            <span className="option-text">All Requests</span>
            <span className="option-count">{requests.length}</span>
          </div>
          <div className="option-description">Show all adoption requests</div>
        </div>
        
        <div 
          className={`dropdown-option ${filter === 'pending' ? 'selected' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <div className="option-content">
            <div className="option-check">
              {filter === 'pending' && <FaCheck />}
            </div>
            <span className="option-text">Pending</span>
            <span className="option-count pending-count">{metrics.pending}</span>
          </div>
          <div className="option-description">Requests awaiting approval</div>
        </div>
        
        <div 
          className={`dropdown-option ${filter === 'approved' ? 'selected' : ''}`}
          onClick={() => setFilter('approved')}
        >
          <div className="option-content">
            <div className="option-check">
              {filter === 'approved' && <FaCheck />}
            </div>
            <span className="option-text">Approved</span>
            <span className="option-count approved-count">{metrics.approved}</span>
          </div>
          <div className="option-description">Successfully approved requests</div>
        </div>
        
        <div 
          className={`dropdown-option ${filter === 'rejected' ? 'selected' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          <div className="option-content">
            <div className="option-check">
              {filter === 'rejected' && <FaCheck />}
            </div>
            <span className="option-text">Rejected</span>
            <span className="option-count rejected-count">{metrics.rejected}</span>
          </div>
          <div className="option-description">Requests that were declined</div>
        </div>
      </div>
    </div>

    {/* Filter Chips */}
    <div className="filter-chips">
      <div className={`filter-chip ${filter !== 'all' ? 'active' : ''}`}>
        <span className="chip-label">Status: {filter}</span>
        {filter !== 'all' && (
          <button 
            className="chip-remove"
            onClick={() => setFilter('all')}
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  </div>
</div>

      {/* Requests Table */}
     {/* Requests Table */}
{/* Requests Table */}
<table className="my-ad-requests-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Dog </th>
      <th>Status</th>
      <th>Vet</th>
  <th>Follow-Ups</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {filteredRequests.map((req) => (
      <tr key={req.id}>
        <td>{req.id}</td>
        <td>
          <div className="a-dash-small-photo">
            <img
              src={req.dog.photo}
              alt={req.dog.name}
              className="dog-photo-small"
            />
            {req.dog.name}
          </div>
        </td>
        <td>
          <span className={`status-badge ${req.status.toLowerCase()}`}>
            {req.status}
          </span>
        </td>
        <td>{req.vetClearance}</td>
        <td>
          {followupSummaries[req.id] ? (
            <span>{followupSummaries[req.id].completed || 0}/4</span>
          ) : (
            req.status === "Approved" ? '—' : 'N/A'
          )}
        </td>
        <td>{req.date}</td>
        <td>
          {/* View Details Button */}
          <button
            className="my-ad-btn small"
            onClick={() => setSelectedRequest(req)}
          >
           < FaEye/>
          </button>

          {/* Delete Button if Pending */}
          {req.status === "Pending" && (
            <button
              className="my-ad-btn small danger"
              onClick={() => handleDelete(req.id)}
            >
              <FaTrash /> 
            </button>
          )}

          {/* Certificate Button if Approved */}
          {req.status === "Approved" && (
            <button
              className="my-ad-btn small primary"
              onClick={() => navigate(`/adoption-certificate/${req.id}`)}
            >
              <FaDownload /> Download Certificate
            </button>
          )}

          {/* Follow-Up Button: allowed for approved requests, disabled when completed 4 weeks */}
          <button
            className="my-ad-btn small primary"
            disabled={!(req.status === "Approved") || (followupSummaries[req.id]?.completed >= 4)}
            title={req.status !== "Approved" ? 'Follow-ups available after approval' : (followupSummaries[req.id]?.completed >= 4 ? 'All 4 weekly reports submitted' : 'Submit weekly follow-up')}
            onClick={() => {
              if (!req || !req.dog || !req.adopter) {
                alert("Please select a valid request!");
                return;
              }
              navigate("/followup", {
                state: {
                  adoptionRequest: { _id: req.id }, // match backend ObjectId
                  dog: req.dog,
                  user: { _id: req.adopter._id, name: req.adopter.name, email: req.adopter.email, phone: req.adopter.phone },
                },
              });
            }}
          >
            <FaFile/> Follow-Up
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
</>
)}


      {/* Notifications */}
      {activeTab === "notifications" && (
      <div className="my-ad-notifications">
        <h2>
          <FaBell size={50}/> Notifications
        </h2>
        <ul>
          {notifications.map((n, i) => (
            <li key={i}> <PawPrint size={20} /> {n}</li>
          ))}
        </ul>
      </div>
      )}


{activeTab === "certificates" && (
    <div className="my-ad-certificates">
  <h2> <ShieldCheck size={50} /> My Certificates</h2>


  {requests
    .filter((r) => r.status === "Approved")
    .map((r) => {
      const certRef = React.createRef(); // create a ref for each certificate card

      const handleDownloadAndScroll = async (type) => {
        if (type === "pdf") {
          await handleDownloadPDF(r); // PDF is async
        } else if (type === "word") {
          handleDownloadWord(r);
        } else if (type === "excel") {
          handleDownloadExcel(r);
        }

        // Scroll to the certificate card after download
        certRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      };

      return (
        <div className="my-ad-certificate-card" key={r.id} ref={certRef}>
          <img src={r.dog.photo} alt={r.dog.name} />
          <div>
            <h3>{r.dog.name}</h3>
            <p>Adoption Date: {r.date}</p>
            <div className="certificate-download-buttons">
              <button
                className="my-ad-btn small"
                onClick={() => handleDownloadAndScroll("pdf")}
              >
                <FaDownload /> PDF
              </button>
              <button
                className="my-ad-btn small"
                onClick={() => handleDownloadAndScroll("word")}
              >
                <FaFileWord /> Word
              </button>
              <button
                className="my-ad-btn small"
                onClick={() => handleDownloadAndScroll("excel")}
              >
                <FaFileExcel /> Excel
              </button>
            </div>
          </div>
        </div>
      );
    })}
</div>
)}


{/* ===== Add Follow-Up Section here ===== */}
{activeTab === "followup" && (
<div className="followup-section">
  <h4><Clipboard size={50} /> Weekly Follow-Ups</h4>
  <p>
    Keep track of your adopted dog's health, behavior, and environment with weekly follow-up reports. 
    Submitting these reports helps our team ensure your furry friend is happy and healthy!
  </p>
  <p>
    You can also view previously submitted reports to monitor your dog's progress over the weeks.
  </p>

  <div className="steps-horizontal">
    <div className="step-card">
      <span className="step-number">Step 1</span>
      <p>Select a dog from your requests table above and click the Follow-Up button.</p>
    </div>
    <div className="step-card">
      <span className="step-number">Step 2</span>
      <p>Fill out the weekly report including health, feeding, behavior, and environment details.</p>
    </div>
    <div className="step-card">
      <span className="step-number">Step 3</span>
      <p>Optionally upload photos and vet reports to keep a record of your dog's progress.</p>
    </div>
    <div className="step-card">
      <span className="step-number">Step 4</span>
      <p>Click " Follow-Up " to send your updates to our team!</p>
    </div>
  </div>

  <br></br>
  

</div>
)}



      {/* Modal */}
      {selectedRequest && (
        <div
          className="my-ad-modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <div className="my-ad-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Request Details</h2>
            <img src={selectedRequest.dog.photo} alt={selectedRequest.dog.name} />
            <h3>
              {selectedRequest.dog.name} ({selectedRequest.dog.breed})
            </h3>
            <div className="d-display-info">
              <p>
                <span>Age: </span>
                {selectedRequest.dog.age}
              </p>
              <p>
                <span>Status: </span>
                {selectedRequest.status}
              </p>
              <p>
                <span>Vet Clearance: </span>
                {selectedRequest.vetClearance}
              </p>
              <p>
                <span>Adoption Date: </span>
                {selectedRequest.date}
              </p>
            </div>
            <br />

            <h4>Adopter Info</h4>

            {isEditing ? (
              <div className="adopter-edit-form">
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={adopterForm.name}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={adopterForm.email}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    type="text"
                    name="phone"
                    value={adopterForm.phone}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Address:
                  <textarea
                    name="address"
                    value={adopterForm.address}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Adopter Status:
                  <select
                    name="adopterStatus"
                    value={adopterForm.adopterStatus}
                    onChange={handleAdopterChange}
                  >
                    <option value="student">Student</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="retired">Retired</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Home Type:
                  <select
                    name="homeType"
                    value={adopterForm.homeType}
                    onChange={handleAdopterChange}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House with Yard</option>
                    <option value="farm">Farm</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <br></br>
                <label>
                  Has Other Pets:
                  <input
                    type="checkbox"
                    name="hasPets"
                    checked={adopterForm.hasPets}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Agreed to Care:
                  <input
                    type="checkbox"
                    name="agree"
                    checked={adopterForm.agree}
                    onChange={handleAdopterChange}
                  />
                </label>
                <button
                  className="my-ad-btn small primary"
                  onClick={handleSaveAdopter}
                >
                  Save
                </button>
                <button
                  className="my-ad-btn small"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="adopter-info">
                <p>
                  <span>Name: </span>
                  {selectedRequest.adopter.name}
                </p>
                <p>
                  <span>Email: </span>
                  {selectedRequest.adopter.email}
                </p>
                <p>
                  <span>Phone: </span>
                  {selectedRequest.adopter.phone}
                </p>
                <p>
                  <span>Address: </span>
                  {selectedRequest.adopter.address}
                </p>
                <p>
                  <span>Adopter Status: </span>
                  {selectedRequest.adopterStatus}
                </p>
                <p>
                  <span>Home Type: </span>
                  {selectedRequest.homeType}
                </p>
                <p>
                  <span>Has Other Pets: </span>
                  {selectedRequest.hasPets ? "Yes" : "No"}
                </p>
                <p>
                  <span>Agreed to Care: </span>
                  {selectedRequest.agree ? "Yes" : "No"}
                </p>
                <button
                  className="my-ad-btn small primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>

                <button
              className="my-ad-btn"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </button>

              </div>
            )}

            
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAdoptionDashboard;