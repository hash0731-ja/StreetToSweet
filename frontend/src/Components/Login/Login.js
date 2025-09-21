import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../contexts/AuthContext";
import bgImage from "../../assets/login-bg.jpg";
import { FaApple, FaFacebook, FaInstagram } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setIsLoggedIn(true); // Update App state for backward compatibility
        
        // Get the redirect URL based on role
        const redirectTo = result.redirectTo || "/dashboard";
        
        alert(`✅ Login successful! Welcome, ${result.user.name}`);
        navigate(redirectTo);
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="welcome-box">
        <h1>Welcome to StreetToSweet!</h1>
        <p>Every paw deserves care. Sign in to continue helping street dogs.</p>
      </div>
      <div className="login-box">
        <h2>Sign In</h2>
        
        {error && (
          <div className="error-message" style={{
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
          <div className="input-group">
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
          <div className="input-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </span>
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing In..." : "Log In"}
          </button>
          {/* ✅ Emergency Report Button */}
          <button
            type="button"
            className="emergency-btn"
            onClick={() => navigate("/emergencyreport")}
            disabled={loading}
          >
             Report Emergency ➠
          </button>
        </form>
        <div className="signup-link">
          <p>
            Don’t have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
        <div className="social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <FaFacebook size={40} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram size={40} />
          </a>
          <a
            href="https://apple.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Apple"
          >
            <FaApple size={40} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
