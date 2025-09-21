import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FollowUpReport.css";

import {
  
  Dog,
} from "lucide-react";

function FollowUpReport() {
  const location = useLocation();
  const navigate = useNavigate();


  // Hooks must always be at the top
  const [week, setWeek] = useState(1);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [summary, setSummary] = useState({ totalRequired: 4, completed: 0, nextDueWeek: 1, submittedWeeks: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    healthCondition: "Healthy",
    feedingNotes: "",
    feedingStatus: "Regular",
    behaviorChecklist: [],
    behaviorNotes: "",
    environmentCheck: "",
    optionalNotes: "",
    photos: [],
    vetReport: null,
  });

  // Props from navigation
  const { adoptionRequest, user, dog } = location.state || {};

  // Fetch previous reports and summary
  useEffect(() => {
    if (!adoptionRequest) return; // Guard inside useEffect

    Promise.all([
      axios.get(`/follow-up-reports/${adoptionRequest._id}/summary`),
      axios.get(`/follow-up-reports/${adoptionRequest._id}`),
    ])
      .then(([summaryRes, listRes]) => {
        const s = summaryRes.data || {};
        setSummary({
          totalRequired: s.totalRequired ?? 4,
          completed: s.completed ?? 0,
          nextDueWeek: s.nextDueWeek ?? 1,
          submittedWeeks: s.submittedWeeks ?? [],
        });
        setSubmittedReports(listRes.data || []);
        setLoadingReports(false);

        if (typeof s.nextDueWeek === 'number') {
          setWeek(s.nextDueWeek);
        } else {
          const count = (listRes.data || []).length;
          setWeek(Math.min(count + 1, 4));
        }
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setLoadingReports(false);
      });
  }, [adoptionRequest]);



  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle checkbox toggle
  const handleChecklist = (item) => {
    setForm((prev) => {
      const updated = prev.behaviorChecklist.includes(item)
        ? prev.behaviorChecklist.filter((i) => i !== item)
        : [...prev.behaviorChecklist, item];
      return { ...prev, behaviorChecklist: updated };
    });
  };

  // Handle photo uploads
  const handlePhotos = (e) => {
    setForm({ ...form, photos: [...e.target.files] });
  };

  // Handle vet report upload
  const handleVetReport = (e) => {
    setForm({ ...form, vetReport: e.target.files[0] });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 0: Validate essential data
  if (!adoptionRequest || !dog) {
    alert("Missing adoption request, dog, or user info!");
    return;
  }

  if (!form.healthCondition || !form.feedingStatus) {
    alert("Please fill required fields!");
    return;
  }


    try {
      const data = new FormData();
     data.append("adoptionRequest", adoptionRequest._id);
    data.append("dog", dog._id);
    data.append("week", week);
    data.append("healthCondition", form.healthCondition);
    data.append("feedingNotes", form.feedingNotes);
    data.append("feedingStatus", form.feedingStatus);
    data.append("behaviorChecklist", JSON.stringify(form.behaviorChecklist));
    data.append("behaviorNotes", form.behaviorNotes);
    data.append("environmentCheck", form.environmentCheck);
    data.append("optionalNotes", form.optionalNotes);

      if (form.photos.length > 0) {
        form.photos.forEach((photo) => data.append("photos", photo));
      }
      if (form.vetReport) {
        data.append("vetReport", form.vetReport);
      }

      console.log("Submitting follow-up report:");
    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }

      setIsSubmitting(true);
      const res = await axios.post("/follow-up-reports", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Follow-up report submitted successfully!");
      navigate("/adoptiondashboard", { 
      state: { activeTab: "followup" } 
    });

    } catch (err) {
      console.error("Error submitting follow-up report:", err.response || err);
    
    if (err.response && err.response.data && err.response.data.message) {
      alert(`Failed to submit: ${err.response.data.message}`);
    } else {
      alert("Failed to submit follow-up report. Please check console for details.");
    }
  } finally {
      setIsSubmitting(false);
    }
};


  // Early return (after hooks are defined)
if (!adoptionRequest || !dog) {
  return (
    <div className="followup-error">
      <p>No adoption request selected.</p>
      <button onClick={() => navigate("/adoptiondashboard")}>
        ← Back to Dashboard
      </button>
    </div>
    );
  }

  return (
    <div className="followup-container">
      <h2>
        <Dog size={50} /> Follow-Up Report - Week {week} for {dog.name}
      </h2>

      {loadingReports ? (
        <p>Loading previous reports...</p>
      ) : (
        <>
          <p>{submittedReports.length} reports already submitted. Progress: {summary.completed}/{summary.totalRequired}</p>
          {summary.completed >= 4 && (
            <div className="followup-complete">All required weekly follow-ups are completed. Thank you!</div>
          )}
        </>
      )}

      <form className="followup-form" onSubmit={handleSubmit}>
        <label>
          Health Condition:
          <select
            name="healthCondition"
            value={form.healthCondition}
            onChange={handleChange}
          >
            <option>Healthy</option>
            <option>Needs Attention</option>
            <option>Critical</option>
          </select>
        </label>

        <label>
          Feeding Notes:
          <textarea
            name="feedingNotes"
            value={form.feedingNotes}
            onChange={handleChange}
          />
        </label>

        <label>
          Feeding Status:
          <select
            name="feedingStatus"
            value={form.feedingStatus}
            onChange={handleChange}
          >
            <option>Regular</option>
            <option>Irregular</option>
            <option>Skipped Meals</option>
          </select>
        </label>

        <fieldset>
          <legend>Behavior Checklist</legend>
          {["Playful", "Aggressive", "Calm", "Anxious"].map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={form.behaviorChecklist.includes(item)}
                onChange={() => handleChecklist(item)}
              />
              {item}
            </label>
          ))}
        </fieldset>

        <label>
          Behavior Notes:
          <textarea
            name="behaviorNotes"
            value={form.behaviorNotes}
            onChange={handleChange}
          />
        </label>

        <label>
          Environment Check:
          <textarea
            name="environmentCheck"
            value={form.environmentCheck}
            onChange={handleChange}
          />
        </label>

        <label>
          Optional Notes:
          <textarea
            name="optionalNotes"
            value={form.optionalNotes}
            onChange={handleChange}
          />
        </label>

        <label>
          Upload Photos:
          <input type="file" multiple onChange={handlePhotos} />
        </label>

        <label>
          Upload Vet Report:
          <input type="file" onChange={handleVetReport} />
        </label>

        <button type="submit" className="submit-btn" disabled={summary.completed >= 4 || isSubmitting}>
          {summary.completed >= 4 ? 'All Weeks Completed' : (isSubmitting ? 'Submitting...' : 'Submit Follow-Up Report')}
        </button>
      </form>
    </div>
  );
}

export default FollowUpReport;
