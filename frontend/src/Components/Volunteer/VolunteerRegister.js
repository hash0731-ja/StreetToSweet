import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import "./VolunteerRegister.css";
import volunteerImg from "../../assets/volunteer-dog.jpg";
import { Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function VolunteerRegister() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    task: "",
    motivation: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Pre-populate form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone,
      }));
    }
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setRegistrationSuccess(false);

    try {
      let url = "http://localhost:3000/volunteerregister";
      let requestBody = formData;

      // If user is authenticated, use the authenticated route and simplified data
      if (isAuthenticated && user) {
        url = "http://localhost:3000/volunteers/register-authenticated";
        requestBody = {
          availability: formData.availability,
          task: formData.task,
          motivation: formData.motivation
        };
      }

      const headers = {
        "Content-Type": "application/json"
      };

      // Add authorization header if user is authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok) {
        // Save volunteer ID to localStorage
        localStorage.setItem("volunteerId", data.volunteer._id);

        // Update auth context and token if new token is provided
        if (data.token && data.user && isAuthenticated) {
          // Update localStorage with new token
          localStorage.setItem('authToken', data.token);
          
          // Update auth context with new user data
          updateUser(data.user);
          
          console.log('Updated token and user role to:', data.user.role);
        }

        let successMessage = "🎉 Thank you for registering as a volunteer!";
        if (data.userRoleUpdated) {
          successMessage += " Your user role has been updated to 'volunteer'.";
        }

        setMessage(successMessage);
        setRegistrationSuccess(true);
        
        // Reset form only if not using pre-filled data
        if (!isAuthenticated) {
          setFormData({
            name: "",
            email: "",
            phone: "",
            availability: "",
            task: "",
            motivation: "",
          });
        } else {
          // Just reset the volunteer-specific fields
          setFormData(prevData => ({
            ...prevData,
            availability: "",
            task: "",
            motivation: "",
          }));
        }

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          handleRedirectToDashboard();
        }, 3000);
      } else {
        setMessage(data.message || data.error || "⚠ Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToDashboard = () => {
    setRedirecting(true);
    if (isAuthenticated) {
      navigate("/volunteer/dashboard");
    } else {
      // For guest registration, redirect to the general volunteer dashboard
      navigate("/volunteerdashboard");
    }
  };

  return (
    <div className="volunteer-register">
      

      <div className="v-header">
        <h1>Together We Can Save More Paws</h1>
      </div>

      <div className="volunteer-container">
        {/* Left Side Image */}
        <div className="volunteer-image">
          <h2>
            <Handshake size={40} /> Join Our Mission
          </h2>
          <p>
            Every hand helps! Be part of our journey to rescue, heal, and find
            loving homes for street dogs.
          </p>
          <br />
          <img src={volunteerImg} alt="Volunteer with dogs" />
        </div>

        {/* Right Side Form */}
        <div className="volunteer-form-container">
          <h2>Register as a Volunteer</h2>
          {isAuthenticated && user ? (
            <div className="auth-user-info">
              <p className="welcome-message">
                👋 Welcome back, <strong>{user.name}</strong>!
              </p>
              <p className="pre-fill-notice">
                ✅ We've pre-filled your personal information. Just complete the volunteer-specific details below.
              </p>
            </div>
          ) : (
            <p className="guest-notice">
              📝 Please fill in all your information below to register as a volunteer.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="volunteer-form">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading || (isAuthenticated && user)}
              placeholder="Enter your full name"
              className={isAuthenticated && user ? "readonly-field" : ""}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || (isAuthenticated && user)}
              placeholder="Enter your email address"
              className={isAuthenticated && user ? "readonly-field" : ""}
            />

            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading || (isAuthenticated && user && user.phone)}
              placeholder="Enter your phone number"
              className={isAuthenticated && user && user.phone ? "readonly-field" : ""}
            />

            <label>Availability *</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Weekends, Evenings, Monday-Friday"
            />

            <label>Preferred Task *</label>
            <select
              name="task"
              value={formData.task}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">-- Select Task --</option>
              <option value="Dog Walking">🐕 Dog Walking</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Feeding">🍽️ Feeding</option>
              <option value="Rescue">🚑 Rescue</option>
              <option value="Post-care Involvement">❤️ Post-care Involvement</option>
              <option value="Other">🔧 Other</option>
            </select>

            <label>Motivation *</label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Tell us why you want to volunteer and help street dogs..."
            ></textarea>

            <button type="submit" className="volunteer-btn" disabled={loading}>
              {loading ? "Registering..." : "Register as Volunteer"}
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes('🎉') ? 'success' : 'error'}`}>
              <p>{message}</p>
            </div>
          )}
          
          {registrationSuccess && !redirecting && (
            <div className="success-actions">
              <button 
                className="dashboard-btn" 
                onClick={handleRedirectToDashboard}
                disabled={redirecting}
              >
                {redirecting ? "Redirecting..." : "Go to Volunteer Dashboard →"}
              </button>
              <p className="auto-redirect-note">
                You will be automatically redirected in a few seconds...
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default VolunteerRegister;
