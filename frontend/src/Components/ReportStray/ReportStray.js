// ReportStray.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rescueRequestAPI from '../../api/rescueRequestAPI';
import './ReportStray.css';

const ReportStray = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    urgency: 'medium',
    animalType: 'dog',
    contactInfo: '',
    photos: [],
    reporterName: '',
    reporterPhone: '',
    reporterEmail: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photos: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Submit to backend API
      const response = await rescueRequestAPI.submitRescueRequest(formData);
      
      // Call parent onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Reset form
      setFormData({
        description: '',
        location: '',
        urgency: 'medium',
        animalType: 'dog',
        contactInfo: '',
        photos: [],
        reporterName: '',
        reporterPhone: '',
        reporterEmail: ''
      });
      
      // Show success message
      alert('Report submitted successfully! Thank you for helping rescue animals.');
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="re-st-report-stray">
      <h2>Report a Stray Dog</h2>
      <form onSubmit={handleSubmit} className="re-st-report-form">
        <div className="re-st-form-group">
          <label htmlFor="animalType">Animal Type *</label>
          <select
            id="animalType"
            name="animalType"
            value={formData.animalType}
            onChange={handleInputChange}
            required
          >
            <option value="dog">Dog</option>
            
            <option value="other">Other</option>
          </select>
        </div>

        <div className="re-st-form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the animal's condition, behavior, etc."
            rows="4"
            required
          />
        </div>

        <div className="re-st-form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Street address or nearby landmarks"
            required
          />
        </div>

        <div className="re-st-form-group">
          <label htmlFor="urgency">Urgency Level</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleInputChange}
          >
            <option value="low">Low - Animal appears healthy</option>
            <option value="medium">Medium - Some concerns</option>
            <option value="high">High - Animal needs immediate help</option>
          </select>
        </div>

        <div className="re-st-form-group">
          <label htmlFor="reporterName">Your Name</label>
          <input
            type="text"
            id="reporterName"
            name="reporterName"
            value={formData.reporterName}
            onChange={handleInputChange}
            placeholder="Your full name"
          />
        </div>

        <div className="re-st-form-group">
          <label htmlFor="reporterPhone">Your Phone Number</label>
          <input
            type="tel"
            id="reporterPhone"
            name="reporterPhone"
            value={formData.reporterPhone}
            onChange={handleInputChange}
            placeholder="Your phone number"
          />
        </div>

        <div className="re-st-form-group">
          <label htmlFor="reporterEmail">Your Email (Optional)</label>
          <input
            type="email"
            id="reporterEmail"
            name="reporterEmail"
            value={formData.reporterEmail}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
          />
        </div>

        <div className="re-st-form-group">
          <label htmlFor="contactInfo">Additional Contact Information</label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleInputChange}
            placeholder="Alternative contact method (optional)"
          />
        </div>

        <div className="re-st-form-group">
          <label htmlFor="photos">Photos</label>
          <input
            type="file"
            id="photos"
            name="photos"
            onChange={handlePhotoUpload}
            multiple
            accept="image/*"
          />
          <small>Upload photos to help rescue teams identify the animal</small>
        </div>

        <button type="submit" disabled={loading} className="re-st-submit-btn">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportStray;
