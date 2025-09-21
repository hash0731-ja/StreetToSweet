import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  PawPrint,
  Users,
  Calendar,
  HeartHandshake,
  LogOut,
  Edit3,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Crown,
  Award,
  Clock,
  Gift
} from 'lucide-react';
import './UserProfile.css';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile, loading } = useAuth();

  // State for user data and editing
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    membership: 'Standard Member',
    photo: '/default-avatar.png',
    adoptedDogs: 0,
    isVolunteer: false,
    volunteerHours: 0,
    eventsRegistered: 0,
    donationsMade: 0,
    joinedDate: ''
  });

  const [activeSection, setActiveSection] = useState("adoptions");
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(userProfile.photo || '/default-avatar.png');
const [photoFile, setPhotoFile] = useState(null); // optional if you want to track the file


  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || user.address || '',
        membership: user.membership || 'Standard Member',
        photo: user.profilePicture || '/default-avatar.png',
        adoptedDogs: user.adoptedDogs || 0,
        isVolunteer: user.role === 'volunteer' || user.isVolunteer || false,
        volunteerHours: user.volunteerHours || 0,
        eventsRegistered: user.eventsRegistered || 0,
        donationsMade: user.donationsMade || 0,
        joinedDate: user.createdAt || user.joinedDate || new Date().toISOString()
      });
      setEditData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || user.address || ''
      });
    }
  }, [user]);

  // Load user's event registrations
  useEffect(() => {
    if (!user) return;
    const loadMyEvents = async () => {
      try {
        const res = await axios.get('/events/mine');
        const list = res.data?.data?.events || [];
        setMyEvents(list);
        setUserProfile(prev => ({ ...prev, eventsRegistered: list.length }));
      } catch (e) {
        // Non-fatal
        console.error('Failed to load my events', e);
      }
    };
    loadMyEvents();
  }, [user]);

  // Load user's donations
  useEffect(() => {
    if (!user) return;
    const loadMyDonations = async () => {
      try {
        const res = await axios.get('/donations/mine');
        const list = res.data?.data?.donations || [];
        setMyDonations(list);
        setUserProfile(prev => ({ ...prev, donationsMade: list.length }));
      } catch (e) {
        console.error('Failed to load my donations', e);
      }
    };
    loadMyDonations();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // If navigated with a preferred section, activate it
  useEffect(() => {
    const target = location.state && location.state.section;
    if (target) {
      setActiveSection(target);
    }
  }, [location.state]);

  useEffect(() => {
  const savedPhoto = localStorage.getItem('userPhoto');
  if (savedPhoto) {
    setPhotoPreview(savedPhoto);
  } else if (user?.profilePicture) {
    setPhotoPreview(user.profilePicture);
  }
}, [user]);

  // handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      navigate("/login");
    }
  };

  // save profile changes
  const handleSaveProfile = async () => {
    setUpdateLoading(true);
    setError('');
    
    try {
      // Update profile through AuthContext
      await updateProfile(editData);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...editData
      }));
      
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const photoURL = URL.createObjectURL(file);
    setPhotoPreview(photoURL);             // update preview immediately
    localStorage.setItem('userPhoto', photoURL);  // save in localStorage
  }
};



  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-header">
          <h1>My Profile</h1>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }
  // Show error if user not found
  if (!user) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-header">
          <h1>Profile Not Found</h1>
          <p>Please log in to view your profile.</p>
          <button 
            className="user-profile-btn primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <h1>My Profile</h1>
        <p>Welcome back, {userProfile.name || 'User'}! 🐕</p>
        {error && (
          <div className="error-message" style={{
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '5px', 
            margin: '10px 0'
          }}>
            {error}
          </div>
        )}
      </div>

      <div className="user-profile-content">
  {/* Personal Info */}
  <div className="user-profile-card">
    <div className="profile-header">
      <div className="avatar-section">
         <img src={photoPreview} alt="User" className="user-profile-photo" />
  {userProfile.membership.includes("Gold") && (
    <div className="premium-badge">
      <Crown size={14} />
      <span>Premium</span>
    </div>
  )}

  {isEditing && (
    <div className="input-with-icon">
      <label>Profile Photo</label>
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
      />
    </div>
  )}
</div>

      <div className="user-profile-info">
        {isEditing ? (
          <div className="edit-fields">
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="edit-input"
              placeholder="Full Name"
            />
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="edit-input"
                placeholder="Email Address"
              />
            </div>
            <div className="input-with-icon">
              <Phone size={16} />
              <input
                type="text"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                className="edit-input"
                placeholder="Phone Number"
              />
            </div>
            
          </div>
        ) : (
          <>
            <h2>{userProfile.name || 'User'}</h2>
            <div className="user-detail">
              <Mail size={16} />
              <span>{userProfile.email || 'No email provided'}</span>
            </div>
            <div className="user-detail">
              <Phone size={16} />
              <span>{userProfile.phone || 'No phone provided'}</span>
            </div>
            
            <div className="membership-badge">
              <Award size={16} />
              <span>{userProfile.membership}</span>
            </div>
            <div className="join-date">
              <Clock size={14} />
              <span>Member since {formatDate(userProfile.joinedDate)}</span>
            </div>
            
          </>
        )}
      </div>

      {/* Buttons aligned right */}
      <div className="user-profile-buttons">
        {isEditing ? (
          <>
            <button
              className="user-profile-btn save"
              onClick={handleSaveProfile}
              disabled={updateLoading}
            >
              <Save size={16} /> {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="user-profile-btn cancel"
              onClick={() => {
                setIsEditing(false);
                setError('');
                setEditData({
                  name: userProfile.name,
                  email: userProfile.email,
                  phone: userProfile.phone,
                  location: userProfile.location
                });
              }}
              disabled={updateLoading}
            >
              <X size={16} /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="user-profile-btn edit"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={16} /> Edit Profile
            </button><br></br>
            <button
              className="user-profile-btn logout"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </button>
          </>
        )}
      </div>
    </div>
  </div>
























        {/* Dashboard Summary Row */}
        <div className="user-profile-summary">
          <div 
            className={`user-profile-summary-card ${activeSection === "adoptions" ? "active" : ""}`} 
            onClick={() => setActiveSection("adoptions")}
          >
            <div className="card-icon adoptions">
              <PawPrint size={24} />
            </div>
            <h3>{userProfile.adoptedDogs}</h3>
            <p>Adoptions</p>
          </div>
          
          <div 
            className={`user-profile-summary-card ${activeSection === "volunteer" ? "active" : ""}`}
            onClick={() => {
              if(userProfile.isVolunteer) {
                setActiveSection("volunteer");
              } else {
                setShowVolunteerModal(true);
              }
            }}
          >
            <div className="card-icon volunteer">
              <Users size={24} />
            </div>
            {userProfile.isVolunteer ? (
              <>
                <h3>{userProfile.volunteerHours}</h3>
                <p>Volunteer Hours</p>
              </>
            ) : (
              <>
                <h3>0</h3>
                <p>Become a Volunteer</p>
              </>
            )}
          </div>
          
          <div 
            className={`user-profile-summary-card ${activeSection === "events" ? "active" : ""}`} 
            onClick={() => setActiveSection("events")}
          >
            <div className="card-icon events">
              <Calendar size={24} />
            </div>
            <h3>{userProfile.eventsRegistered}</h3>
            <p>Events</p>
          </div>
          
          <div 
            className={`user-profile-summary-card ${activeSection === "donations" ? "active" : ""}`} 
            onClick={() => setActiveSection("donations")}
          >
            <div className="card-icon donations">
              <Gift size={24} />
            </div>
            <h3>{userProfile.donationsMade}</h3>
            <p>Donations</p>
          </div>
        </div>

        {/* Section Details */}
        <div className="user-profile-details">
          {activeSection === "adoptions" && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><PawPrint size={24} /> Your Adoption History</h3>
                {userProfile.adoptedDogs > 0 && (
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/adoptiondashboard')}
                  >
                    View Adoption Dashboard
                  </button>
                )}
              </div>
              
              {userProfile.adoptedDogs > 0 ? (
                <div className="adoptions-content">
                  <p>You've given a forever home to <strong>{userProfile.adoptedDogs} dogs</strong>!</p>
                  <div className="achievement-badge">
                    <Award size={18} />
                    <span>Canine Guardian</span>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <PawPrint size={48} />
                  {/* <p>No adoption requests yet</p> */}
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/adoptiondashboard')}
                  >
                    My Adoption Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "volunteer" && userProfile.isVolunteer && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><Users size={24} /> Volunteer Dashboard</h3>
                <button
                  className="user-profile-btn primary"
                  onClick={() => navigate('/volunteerdashboard')}
                >
                  Go to Volunteer Hub
                </button>
              </div>
              
              <div className="volunteer-stats">
                <div className="stat-item">
                  <h4>{userProfile.volunteerHours}</h4>
                  <p>Hours Contributed</p>
                </div>
                <div className="stat-item">
                  <h4>12</h4>
                  <p>Dogs Walked</p>
                </div>
                <div className="stat-item">
                  <h4>8</h4>
                  <p>Health Updates</p>
                </div>
              </div>
              
              <div className="next-task">
                <h4>Your Next Task</h4>
                <p>Saturday: Morning feeding shift (8:00 AM - 10:00 AM)</p>
              </div>
            </div>
          )}

          {activeSection === "events" && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><Calendar size={24} /> Your Registered Events</h3>
                <button
                  className="user-profile-btn primary"
                  onClick={() => navigate('/events')}
                >
                  Browse All Events
                </button>
              </div>
              {myEvents.length > 0 ? (
                <div className="events-list">
                  {myEvents.map(ev => (
                    <div key={ev._id} className="event-list-item">
                      <div className="event-thumb">
                        {ev.photos && ev.photos[0] ? (
                          <img src={ev.photos[0].startsWith('http') ? ev.photos[0] : `http://localhost:3000${ev.photos[0]}`} alt={ev.title} />
                        ) : (
                          <div className="event-thumb-placeholder">EV</div>
                        )}
                      </div>
                      <div className="event-info">
                        <h3>{ev.title}</h3>
                        <p>
                          <Calendar size={14} /> {ev.date ? new Date(ev.date).toLocaleDateString() : ''}
                          {' '}• {ev.startTime || ''}
                        </p>
                        <p><MapPin size={14} /> {ev.location}</p>
                      </div>
                      <div className="event-actions">
                        <span className={`status-badge ${ev.status}`}>{ev.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No events registered yet</p>
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/events')}
                  >
                    View Upcoming Events
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "donations" && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><Gift size={24} /> Your Donations</h3>
                <button
                  className="user-profile-btn primary"
                  onClick={() => navigate('/donate')}
                >
                  Make Another Donation
                </button>
              </div>
              
              {myDonations.length > 0 ? (
                <div className="donations-content">
                  <p>You've made <strong>{myDonations.length} donations</strong> to support our furry friends!</p>
                  <div className="donations-list">
                    {myDonations.map(d => (
                      <div key={d._id} className="donation-item">
                        <div className="donation-main">
                          <div className="donation-amount">LKR {Number(d.amount).toLocaleString()}</div>
                          <div className="donation-meta">
                            <span className="donation-method">{d.paymentMethod}</span>
                            {d.cardLast4 && <span> • Card •••• {d.cardLast4}</span>}
                            {d.bankName && <span> • {d.bankName}</span>}
                            {d.reference && <span> • Ref: {d.reference}</span>}
                          </div>
                        </div>
                        <div className="donation-side">
                          <span className="donation-date">{new Date(d.createdAt).toLocaleDateString()}</span>
                          <span className="donation-frequency">{d.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <Gift size={48} />
                  <p>No donations yet</p>
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/donate')}
                  >
                    Make Your First Donation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Modal */}
      {showVolunteerModal && (
        <div className="user-profile-modal-overlay">
          <div className="user-profile-modal">
            <div className="modal-icon">
              <Users size={32} />
            </div>
            <h3>Join Our Volunteer Team</h3>
            <p>Make a pawsitive impact by helping care for our rescue dogs. Volunteers assist with walking, feeding, and providing love to our furry friends.</p>
            <div className="user-profile-modal-actions">
              <button
                className="user-profile-btn primary"
                onClick={() => {
                  setShowVolunteerModal(false);
                  navigate('/volunteerregister');
                }}
              >
                Register as Volunteer
              </button>
              <button
                className="user-profile-btn cancel"
                onClick={() => setShowVolunteerModal(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;