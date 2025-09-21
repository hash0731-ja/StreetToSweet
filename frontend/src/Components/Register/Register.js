import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { useAuth } from "../../contexts/AuthContext";
import bgImage from "../../assets/register-bg.jpg";


function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user" // Default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, role } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await register({
        name,
        email,
        phone,
        password,
        role
      });

      if (result.success) {
        alert(`✅ Registration successful! Welcome, ${result.user.name}`);
        
        // Get the redirect URL based on role
        const redirectTo = result.redirectTo || "/dashboard";
        navigate(redirectTo);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rg-register-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="rg-welcome-box">
        <h1>Welcome to StreetToSweet!</h1>
        <p>Register to Start Your Journey</p>
      </div>
      <div className="rg-signup-box">
        <h2>Create Your Account</h2>
        
        {error && (
          <div className="rg-error-message" style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="rg-input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="rg-input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="rg-input-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="rg-input-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
              <option value="vet">Veterinarian</option>
            </select>
          </div>
          <div className="rg-input-group">
            <label>Password</label>
            
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
           
          </div>
          <div className="rg-input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              
            />
            
          </div>

          <button type="submit" className="rg-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          <button
            type="button"
            className="emergency-btn"
            onClick={() => navigate("/emergencyreport")}
            disabled={loading}
          >
             Report Emergency ➠
          </button>
        </form>
        <div className="rg-signin-link">
          <p>
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
