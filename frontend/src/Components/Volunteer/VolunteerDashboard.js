import React, { useState, useEffect } from 'react';
import {
  Bell,
  User,
  Clock,
  PawPrint,
  MapPin,
  Calendar,
  Edit3,
  BarChart3,
  Heart,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  LogOut,
  Plus,
  TrendingUp,
  Award,
  Mail,
  Phone,
  Upload,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  CalendarDays,
  ClipboardList,
  Users,
  Eye,
  Edit
} from 'lucide-react';
import './VolunteerDashboard.css';
import VolunteerDashboardAPI from '../../api/volunteerDashboardAPI';

const VolunteerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API instance
  const [api] = useState(() => new VolunteerDashboardAPI());
  
  // Data states
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableDogs, setAvailableDogs] = useState([]);
  const [healthReports, setHealthReports] = useState([]);
  const [walkingData, setWalkingData] = useState({ 
    walks: [], 
    statistics: {},
    totalDistance: 0,
    totalDuration: '0h 0m',
    uniqueDogs: 0,
    recentWalks: []
  });
  const [events, setEvents] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Form states
  const [newBlogPost, setNewBlogPost] = useState({
    title: '',
    content: ''
  });

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [walkLog, setWalkLog] = useState({
    dogId: '',
    distance: '',
    duration: '',
    activities: [],
    walkDate: new Date().toISOString().split('T')[0],
    walkTime: new Date().toTimeString().slice(0, 5),
    route: '',
    notes: '',
    weather: '',
    walkQuality: 'good',
    dogBehavior: 'calm',
    startTime: '',
    endTime: ''
  });

  const [healthReport, setHealthReport] = useState({
    dogId: '',
    eatingHabits: 'normal',
    mood: 'normal',
    weight: '',
    observations: '',
    photos: []
  });

  // Modal states
  const [showHealthReportModal, setShowHealthReportModal] = useState(false);
  const [selectedDogForModal, setSelectedDogForModal] = useState(null);
  const [modalHealthReport, setModalHealthReport] = useState({
    dogId: '',
    eatingHabits: 'normal',
    mood: 'normal',
    weight: '',
    observations: '',
    photos: []
  });

  // Volunteer Management States (NEW)
  const [assignedDogs, setAssignedDogs] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Check if user is authenticated and load data if valid token exists
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found, user needs to login');
      setError('Please login to access the volunteer dashboard.');
      setLoading(false);
      return;
    }
    loadDashboardData();
    loadVolunteerManagementData(); // NEW: Load volunteer management data
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard overview
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      setUserData(overviewData?.data?.volunteerInfo || null);

      // Load assigned tasks
      const tasksData = await api.getAssignedTasks();
      setAssignedTasks(tasksData?.data?.tasksByDog || []);

      // Load available dogs for walking
      const dogsData = await api.getAvailableDogs();
      setAvailableDogs(dogsData?.data?.dogs || []);

      // Load walking data
      const walkData = await api.getWalkingData();
      setWalkingData(walkData?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });

      // Load events
      const eventsData = await api.getUpcomingEvents();
      setEvents(eventsData?.data?.events || []);

      // Load blog posts
      try {
        const blogData = await api.getBlogPosts();
        setBlogPosts(Array.isArray(blogData?.data?.posts) ? blogData.data.posts : []);
      } catch (blogError) {
        console.error('Failed to load blog posts:', blogError);
        setBlogPosts([]);
      }

      // Load health reports
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
console.log('=== DASHBOARD DATA LOADED ===');
    console.log('User Data:', overviewData?.data?.volunteerInfo);
    console.log('Dashboard Data:', overviewData?.data);
    console.log('Assigned Tasks:', tasksData?.data?.tasksByDog);
    console.log('Available Dogs:', dogsData?.data?.dogs);
    console.log('======================');


      // Set sample notifications
      setNotifications([
        { id: 1, message: 'Your shift starts in 30 minutes', read: false, timestamp: '10 mins ago' },
        { id: 2, message: 'Health report submitted successfully', read: false, timestamp: '45 mins ago' },
        { id: 3, message: 'New blog post approved', read: true, timestamp: '2 hours ago' }
      ]);

    } catch (error) {
      setError('Failed to load dashboard data: ' + (error.message || 'Unknown error'));
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Load volunteer management data
  const loadVolunteerManagementData = async () => {
  try {
    console.log('Loading volunteer management data...');
    
    // Load assigned dogs for this volunteer
    const assignedDogsResponse = await api.getAssignedDogs();
    console.log('Assigned dogs response:', assignedDogsResponse);
    setAssignedDogs(assignedDogsResponse?.data || []);

    // Fetch volunteer tasks
    const tasksResponse = await api.getVolunteerTasks();
    console.log('Volunteer tasks response:', tasksResponse);
    setVolunteerTasks(tasksResponse?.data || []);

    // DEBUG: Check volunteer management data
    console.log('Assigned Dogs:', assignedDogsResponse?.data);
    console.log('Volunteer Tasks:', tasksResponse?.data);
    console.log('==============================');
    
  } catch (error) {
    console.error('Error loading volunteer management data:', error);
    
    // Fallback: Try to get data from the dashboard overview
    if (dashboardData?.assignedDogs) {
       console.log('Using fallback data from dashboard');
      setAssignedDogs(dashboardData.assignedDogs);
    }
    
    // Set empty arrays as fallback
    if (assignedDogs.length === 0) {
      setAssignedDogs([]);
    }
    if (volunteerTasks.length === 0) {
      setVolunteerTasks([]);
    }
  }
};

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add this useEffect to monitor state changes
useEffect(() => {
  console.log('=== STATE UPDATES ===');
  console.log('User Data:', userData);
  console.log('Assigned Dogs:', assignedDogs);
  console.log('Volunteer Tasks:', volunteerTasks);
  console.log('Dashboard Data:', dashboardData);
  console.log('=====================');
}, [userData, assignedDogs, volunteerTasks, dashboardData]);

  useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('No token found, user needs to login');
    setError('Please login to access the volunteer dashboard.');
    setLoading(false);
    return;
  }
  loadDashboardData();
}, []);

// Load volunteer management data when dashboard data is loaded
useEffect(() => {
  if (dashboardData && userData) {
    loadVolunteerManagementData();
  }
}, [dashboardData, userData]);

  // NEW: Task management functions
  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
  try {
    console.log('Updating task status:', taskId, status);
    
    const response = await api.updateTaskStatus(taskId, status);
    console.log('Task status update response:', response);
    
    // Reload tasks
    const tasksResponse = await api.getVolunteerTasks();
    setVolunteerTasks(tasksResponse?.data || []);
    
    // Show success message
    alert(`Task marked as ${status}`);
    
  } catch (error) {
    console.error('Error updating task status:', error);
    
    let errorMessage = 'Failed to update task status';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    alert(errorMessage);
  }
};

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const toggleEventRSVP = async (eventId) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event) return;

      if (event.isRegistered) {
        await api.cancelEventRegistration(eventId);
      } else {
        await api.registerForEvent(eventId);
      }
      
      // Reload events data
      const eventsData = await api.getUpcomingEvents();
      setEvents(eventsData?.data?.events || []);
    } catch (error) {
      console.error('Error toggling event RSVP:', error);
      setError('Failed to update event registration');
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      await api.completeTask(taskId, 'Task completed successfully');
      
      // Reload tasks and dashboard data
      const tasksData = await api.getAssignedTasks();
      setAssignedTasks(tasksData?.data?.tasksByDog || []);
      
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  };

  // Open health report modal
  const openHealthReportModal = (dog) => {
    setSelectedDogForModal(dog);
    setModalHealthReport({
      dogId: dog._id,
      eatingHabits: 'normal',
      mood: 'normal',
      weight: '',
      observations: '',
      photos: []
    });
    setShowHealthReportModal(true);
  };

  // Close health report modal
  const closeHealthReportModal = () => {
    setShowHealthReportModal(false);
    setSelectedDogForModal(null);
    setModalHealthReport({
      dogId: '',
      eatingHabits: 'normal',
      mood: 'normal',
      weight: '',
      observations: '',
      photos: []
    });
  };

  // Handle health report submission from modal
  const handleModalHealthReportSubmit = async () => {
    try {
      if (!modalHealthReport.dogId) {
        alert('Please select a dog');
        return;
      }

      const formData = api.createHealthReportFormData(modalHealthReport, modalHealthReport.photos || []);
      await api.submitHealthReport(formData);
      
      // Close modal and reload data
      closeHealthReportModal();
      
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
      
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      
      alert('Health report submitted successfully!');
    } catch (error) {
      console.error('Error submitting health report:', error);
      setError('Failed to submit health report');
    }
  };

  // Original health report handler (kept for compatibility)
  const handleHealthReportSubmit = async (dogId, reportData = null) => {
    try {
      const data = reportData || healthReport;
      const finalData = { ...data };
      
      if (!finalData.dogId && dogId) {
        finalData.dogId = dogId;
      }

      if (!finalData.dogId) {
        alert('Please select a dog');
        return;
      }

      const formData = api.createHealthReportFormData(finalData, finalData.photos || []);
      await api.submitHealthReport(formData);
      
      // Reset form and reload data
      setHealthReport({
        dogId: '',
        eatingHabits: 'normal',
        mood: 'normal',
        weight: '',
        observations: '',
        photos: []
      });
      
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
      
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      
      alert('Health report submitted successfully!');
    } catch (error) {
      console.error('Error submitting health report:', error);
      setError('Failed to submit health report');
    }
  };

  const handleNewBlogPost = async () => {
    try {
      if (!newBlogPost.title || !newBlogPost.content) {
        alert('Please fill in both title and content');
        return;
      }

      const formData = api.createBlogPostFormData(newBlogPost);
      await api.createBlogPost(formData);
      
      // Reset form and reload data
      setNewBlogPost({ title: '', content: '' });
      setShowNewPostForm(false);
      
      try {
        const blogData = await api.getBlogPosts();
        setBlogPosts(Array.isArray(blogData?.data?.posts) ? blogData.data.posts : []);
      } catch (reloadError) {
        console.error('Failed to reload blog posts after creation:', reloadError);
      }
      
      alert('Blog post submitted successfully!');
    } catch (error) {
      console.error('Error creating blog post:', error);
      setError('Failed to create blog post');
    }
  };

  const handleWalkLog = async () => {
    try {
      if (!walkLog.dogId) {
        alert('Please select a dog');
        return;
      }
      if (!walkLog.distance || parseFloat(walkLog.distance) <= 0) {
        alert('Please enter a valid distance (greater than 0 km)');
        return;
      }
      if (!walkLog.duration || parseInt(walkLog.duration) <= 0) {
        alert('Please enter a valid duration (greater than 0 minutes)');
        return;
      }
      if (!walkLog.walkDate) {
        alert('Please select a date');
        return;
      }
      if (!walkLog.walkTime) {
        alert('Please select a time');
        return;
      }
      if (walkLog.activities.length === 0) {
        alert('Please select at least one activity');
        return;
      }

      console.log('Submitting walk data:', walkLog);

      const walkData = {
        dogId: walkLog.dogId,
        distance: parseFloat(walkLog.distance),
        duration: parseInt(walkLog.duration),
        activities: walkLog.activities,
        walkDate: walkLog.walkDate,
        walkTime: walkLog.walkTime,
        route: walkLog.route || '',
        notes: walkLog.notes || '',
        weather: walkLog.weather || '',
        walkQuality: walkLog.walkQuality || 'good',
        dogBehavior: walkLog.dogBehavior || 'calm',
        startTime: new Date(`${walkLog.walkDate}T${walkLog.walkTime}`).toISOString(),
        endTime: new Date(new Date(`${walkLog.walkDate}T${walkLog.walkTime}`).getTime() + parseInt(walkLog.duration) * 60000).toISOString()
      };

      console.log('Processed walk data:', walkData);

      const formData = api.createWalkFormData(walkData);
      
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await api.logWalk(formData);
      
      // Reset form and reload data
      setWalkLog({
        dogId: '',
        distance: '',
        duration: '',
        activities: [],
        walkDate: new Date().toISOString().split('T')[0],
        walkTime: new Date().toTimeString().slice(0, 5),
        route: '',
        notes: '',
        weather: '',
        walkQuality: 'good',
        dogBehavior: 'calm',
        startTime: '',
        endTime: ''
      });
      
      // Reload walking data
      const walkDataUpdated = await api.getWalkingData();
      setWalkingData(walkDataUpdated?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });
      
      // Reload dashboard data
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      
      alert('Walk logged successfully!');
    } catch (error) {
      console.error('Error logging walk:', error);
      
      let errorMessage = 'Failed to log walk';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error: Could not connect to server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEditBlogPost = async (postId) => {
    try {
      const postToEdit = blogPosts.find(post => post._id === postId);
      if (postToEdit) {
        setNewBlogPost({
          title: postToEdit.title || '',
          content: postToEdit.content || ''
        });
        setShowNewPostForm(true);
        
        // Scroll to the form
        setTimeout(() => {
          document.querySelector('.v-dash-new-post-form')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error preparing blog post for edit:', error);
      setError('Failed to load blog post for editing');
    }
  };

  const handleDeleteBlogPost = async (postId) => {
    try {
      if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
        await api.deleteBlogPost(postId);
        
        // Remove from local state immediately for better UX
        setBlogPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        
        alert('Blog post deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      
      let errorMessage = 'Failed to delete blog post';
      if (error.message) {
        if (error.message.includes('Cannot delete blog post with status')) {
          errorMessage = 'Cannot delete published blog posts';
        } else if (error.message.includes('not found or you do not have permission')) {
          errorMessage = 'Blog post not found or you do not have permission to delete it';
        } else if (error.message.includes('Blog post not found')) {
          errorMessage = 'Blog post not found';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
      setError(errorMessage);
      
      // Reload blog posts to ensure consistency
      try {
        const blogData = await api.getBlogPosts();
        setBlogPosts(Array.isArray(blogData?.data?.posts) ? blogData.data.posts : []);
      } catch (reloadError) {
        console.error('Failed to reload blog posts:', reloadError);
      }
    }
  };

  const calculateTotalTime = (currentTime, newDuration) => {
    try {
      const [currentHours, currentMins] = currentTime.split('h ');
      const [newHours, newMins] = newDuration.split(':');
      
      const totalHours = parseInt(currentHours || 0) + parseInt(newHours || 0);
      const totalMins = parseInt(currentMins || 0) + parseInt(newMins || 0);
      
      return `${totalHours}h ${totalMins}m`;
    } catch (error) {
      console.error('Error calculating total time:', error);
      return currentTime;
    }
  };

  // Helper: robustly extract the dog id from a health report
  const getReportDogId = (report) => {
    if (!report) return '';
    if (report.dogId) {
      if (typeof report.dogId === 'string') return report.dogId;
      if (typeof report.dogId === 'object' && report.dogId._id) return report.dogId._id;
    }
    if (report.dog) {
      if (typeof report.dog === 'string') return report.dog;
      if (typeof report.dog === 'object' && (report.dog._id || report.dog.id)) return report.dog._id || report.dog.id;
    }
    return report.dog_id || report.dogID || '';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
  };

  const handleDownloadReport = () => {
    alert('Downloading volunteer report...');
  };

  // NEW: Render Volunteer Management Section
  const renderVolunteerManagement = () => {
    return(
    
    <section className="v-dash-section">
      <div className="v-dash-section-header">
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          👥 Volunteer Management
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          fontWeight: '400'
        }}>
          Manage your assigned dogs and tasks
        </p>
      </div>

      {/* Assigned Dogs Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <PawPrint size={24} />
          Your Assigned Dogs
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px'
        }}>
          {assignedDogs.length > 0 ? assignedDogs.map((assignment) => (
            <div 
              key={assignment.dogId?._id || assignment._id}
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                marginBottom: '16px'
              }}>
                <img 
                  src={assignment.dogId?.photo ? `http://localhost:3000/uploads/dogs/${assignment.dogId.photo}` : 'https://placedog.net/300/300?id=1'} 
                  alt={assignment.dogId?.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {assignment.dogId?.name}
                  </h4>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>
                    {assignment.dogId?.breed || 'Mixed Breed'}
                  </p>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#3b82f6',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Assigned
                </span>
                <button 
                  onClick={() => openHealthReportModal(assignment.dogId)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Health Report
                </button>
              </div>
            </div>
          )) : (
            <div style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              border: '2px dashed #e5e7eb'
            }}>
              <PawPrint size={48} color="#9ca3af" />
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600',
                color: '#6b7280',
                margin: '16px 0 8px 0'
              }}>
                No Dogs Assigned
              </h4>
              <p style={{ 
                fontSize: '0.875rem',
                color: '#9ca3af',
                margin: '0'
              }}>
                You haven't been assigned any dogs yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ClipboardList size={24} />
          Your Tasks
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px'
        }}>
          {volunteerTasks.length > 0 ? volunteerTasks.map((task) => (
            <div 
              key={task._id}
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                borderLeft: `4px solid ${
                  task.status === 'completed' ? '#10b981' : 
                  task.status === 'in-progress' ? '#3b82f6' : 
                  '#f59e0b'
                }`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <h4 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0'
                }}>
                  {task.taskType}
                </h4>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: 
                    task.status === 'completed' ? '#dcfce7' : 
                    task.status === 'in-progress' ? '#dbeafe' : 
                    '#fef3c7',
                  color: 
                    task.status === 'completed' ? '#166534' : 
                    task.status === 'in-progress' ? '#1e40af' : 
                    '#92400e',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {task.status}
                </span>
              </div>
              
              {task.taskDescription && (
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {task.taskDescription}
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    margin: '0 0 4px 0'
                  }}>
                    Scheduled
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#374151',
                    margin: '0',
                    fontWeight: '500'
                  }}>
                    {task.scheduledTime ? new Date(task.scheduledTime).toLocaleString() : 'Not scheduled'}
                  </p>
                </div>
                
                {task.priority && (
                  <div>
                    <p style={{ 
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: '0 0 4px 0',
                      textAlign: 'right'
                    }}>
                      Priority
                    </p>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: 
                        task.priority === 'high' ? '#fef2f2' : 
                        task.priority === 'medium' ? '#fffbeb' : 
                        '#f0fdf4',
                      color: 
                        task.priority === 'high' ? '#dc2626' : 
                        task.priority === 'medium' ? '#d97706' : 
                        '#16a34a',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                <button 
                  onClick={() => handleViewTaskDetails(task)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  <Eye size={12} style={{ marginRight: '4px' }} />
                  Details
                </button>
                
                {task.status !== 'completed' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              border: '2px dashed #e5e7eb'
            }}>
              <ClipboardList size={48} color="#9ca3af" />
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600',
                color: '#6b7280',
                margin: '16px 0 8px 0'
              }}>
                No Tasks Assigned
              </h4>
              <p style={{ 
                fontSize: '0.875rem',
                color: '#9ca3af',
                margin: '0'
              }}>
                You don't have any tasks assigned at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

  // NEW: Task Details Modal
  const renderTaskDetailsModal = () => (
    showTaskDetails && selectedTask && (
      <div className="v-dash-modal-overlay">
        <div className="v-dash-modal">
          <div className="v-dash-modal-header">
            <h3>Task Details</h3>
            <button 
              className="v-dash-modal-close"
              onClick={() => setShowTaskDetails(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="v-dash-modal-content">
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {selectedTask.taskType}
              </h4>
              <span style={{
                padding: '4px 12px',
                backgroundColor: 
                  selectedTask.status === 'completed' ? '#dcfce7' : 
                  selectedTask.status === 'in-progress' ? '#dbeafe' : 
                  '#fef3c7',
                color: 
                  selectedTask.status === 'completed' ? '#166534' : 
                  selectedTask.status === 'in-progress' ? '#1e40af' : 
                  '#92400e',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {selectedTask.status}
              </span>
            </div>
            
            {selectedTask.taskDescription && (
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0',
                  lineHeight: '1.5'
                }}>
                  {selectedTask.taskDescription}
                </p>
              </div>
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Scheduled Time
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {selectedTask.scheduledTime ? new Date(selectedTask.scheduledTime).toLocaleString() : 'Not scheduled'}
                </p>
              </div>
              
              <div>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Priority
                </h5>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: 
                    selectedTask.priority === 'high' ? '#fef2f2' : 
                    selectedTask.priority === 'medium' ? '#fffbeb' : 
                    '#f0fdf4',
                  color: 
                    selectedTask.priority === 'high' ? '#dc2626' : 
                    selectedTask.priority === 'medium' ? '#d97706' : 
                    '#16a34a',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {selectedTask.priority || 'Normal'}
                </span>
              </div>
            </div>
            
            {selectedTask.estimatedDuration && (
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Estimated Duration
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {selectedTask.estimatedDuration} minutes
                </p>
              </div>
            )}
            
            {selectedTask.assignedDate && (
              <div>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Assigned Date
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {new Date(selectedTask.assignedDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          <div className="v-dash-modal-actions">
            <button 
              className="v-dash-secondary-btn"
              onClick={() => setShowTaskDetails(false)}
            >
              Close
            </button>
            {selectedTask.status !== 'completed' && (
              <button 
                className="v-dash-primary-btn"
                onClick={() => {
                  handleUpdateTaskStatus(selectedTask._id, 'completed');
                  setShowTaskDetails(false);
                }}
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );

  // Show loading spinner
  if (loading) {
    return (
      <div className="v-dash-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="v-dash-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Error: {error}</p>
          <button onClick={loadDashboardData}>Retry</button>
        </div>
      </div>
    );
  }

  // Show login message if no user data
  if (!userData) {
    return (
      <div className="v-dash-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Please login to access the volunteer dashboard.</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="v-dash-container">
      {/* Health Report Modal */}
      {showHealthReportModal && (
        <div className="v-dash-modal-overlay">
          <div className="v-dash-modal">
            <div className="v-dash-modal-header">
              <h3>Submit Health Report</h3>
              <button 
                className="v-dash-modal-close"
                onClick={closeHealthReportModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="v-dash-modal-content">
              {selectedDogForModal && (
                <div className="v-dash-modal-dog-info">
                  <img 
                    src={selectedDogForModal.photo ? `http://localhost:3000/uploads/dogs/${selectedDogForModal.photo}` : 'https://placedog.net/300/300?id=1'} 
                    alt={selectedDogForModal.name}
                  />
                  <div>
                    <h4>{selectedDogForModal.name}</h4>
                    <p>Health Status: {selectedDogForModal.healthStatus || 'Unknown'}</p>
                  </div>
                </div>
              )}
              
              <div className="v-dash-form-group">
                <label>Eating Habits</label>
                <select 
                  value={modalHealthReport.eatingHabits}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, eatingHabits: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="increased">Increased</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <div className="v-dash-form-group">
                <label>Mood/Behavior</label>
                <select 
                  value={modalHealthReport.mood}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, mood: e.target.value})}
                >
                  <option value="playful">Playful</option>
                  <option value="quiet">Quiet</option>
                  <option value="anxious">Anxious</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="depressed">Depressed</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
              
              <div className="v-dash-form-group">
                <label>Weight (kg)</label>
                <input 
                  type="number" 
                  value={modalHealthReport.weight}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, weight: e.target.value})}
                  placeholder="Enter weight"
                />
              </div>
              
              <div className="v-dash-form-group">
                <label>Observations</label>
                <textarea 
                  value={modalHealthReport.observations}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, observations: e.target.value})}
                  placeholder="Enter any observations here..."
                  rows="3"
                />
              </div>
              
              <div className="v-dash-form-group">
                <label>Upload Photos</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    type="button"
                    className="v-dash-secondary-btn"
                    onClick={() => document.getElementById('modal-health-photo-input').click()}
                    style={{ 
                      padding: '12px 16px', 
                      border: '2px dashed #ccc', 
                      backgroundColor: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={18} />
                    <span>Choose Photos</span>
                  </button>
                  
                  <input 
                    id="modal-health-photo-input"
                    type="file" 
                    accept="image/*" 
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => setModalHealthReport({...modalHealthReport, photos: Array.from(e.target.files || [])})}
                  />
                  
                  {Array.isArray(modalHealthReport.photos) && modalHealthReport.photos.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
                        {modalHealthReport.photos.length} photo(s) selected:
                      </small>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {modalHealthReport.photos.map((file, index) => (
                          <span 
                            key={index} 
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#e3f2fd', 
                              borderRadius: '4px', 
                              fontSize: '12px',
                              color: '#1976d2'
                            }}
                          >
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="v-dash-modal-actions">
              <button 
                className="v-dash-secondary-btn"
                onClick={closeHealthReportModal}
              >
                Cancel
              </button>
              <button 
                className="v-dash-primary-btn"
                onClick={handleModalHealthReportSubmit}
              >
                Submit Health Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {renderTaskDetailsModal()}

      {/* Header */}
      <header className="v-dash-header">
        <div className="v-dash-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </div>
        
        <div className="v-dash-brand">
          <PawPrint size={28} />
          <h1>StreetToSweet Shelter</h1>
        </div>
        
        <div className="v-dash-header-actions">
          <div className="v-dash-notifications">
            <button 
              className="v-dash-notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="v-dash-notification-badge">{unreadNotifications}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="v-dash-notification-dropdown">
                <div className="v-dash-notification-header">
                  <h3>Notifications</h3>
                  <button 
                    className="v-dash-clear-btn"
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  >
                    Mark all as read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="v-dash-no-notifications">No notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`v-dash-notification-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <p>{notif.message}</p>
                      <span className="v-dash-notification-time">{notif.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="v-dash-user">
            <div className="v-dash-user-info">
              <span className="v-dash-user-name">{userData.name || 'User'}</span>
              <span className="v-dash-user-role">{userData.role || 'Volunteer'}</span>
            </div>
            <div 
              className="v-dash-user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {userData.profilePic ? (
                <img src={userData.profilePic} alt={userData.name || 'User'} />
              ) : (
                <User size={32} />
              )}
              {showUserMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showUserMenu && (
              <div className="v-dash-user-menu">
                <div className="v-dash-user-details">
                  <h4>{userData.name || 'User'}</h4>
                  <p>{userData.role || 'Volunteer'}</p>
                  <div className="v-dash-user-contact">
                    <Mail size={14} /> {userData.email || 'No email'}
                  </div>
                  <div className="v-dash-user-contact">
                    <Phone size={14} /> {userData.phone || 'No phone'}
                  </div>
                </div>
                <button className="v-dash-menu-item">
                  <User size={16} />
                  <span>Edit Profile</span>
                </button>
                <button className="v-dash-menu-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="v-dash-layout">
        {/* Sidebar Navigation */}
        <nav className={`v-dash-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="v-dash-nav-items">
            <button 
              className={`v-dash-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('overview');
                setMobileMenuOpen(false);
              }}
            >
              <BarChart3 size={20} />
              <span>Overview</span>
            </button>
            
            <button 
              className={`v-dash-nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('tasks');
                setMobileMenuOpen(false);
              }}
            >
              <CheckCircle size={20} />
              <span>Tasks & Care</span>
            </button>
            
            {/* NEW: Volunteer Management Navigation Item */}
            <button 
              className={`v-dash-nav-item ${activeSection === 'volunteer-management' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('volunteer-management');
                setMobileMenuOpen(false);
              }}
            >
              <Users size={20} />
              <span>My Assignments</span>
            </button>
            
            <button 
              className={`v-dash-nav-item ${activeSection === 'walks' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('walks');
                setMobileMenuOpen(false);
              }}
            >
              <MapPin size={20} />
              <span>Walking Tracker</span>
            </button>
            
            <button 
              className={`v-dash-nav-item ${activeSection === 'events' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('events');
                setMobileMenuOpen(false);
              }}
            >
              <Calendar size={20} />
              <span>Events</span>
            </button>
            
            <button 
              className={`v-dash-nav-item ${activeSection === 'blog' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('blog');
                setMobileMenuOpen(false);
              }}
            >
              <Edit3 size={20} />
              <span>Blog & Stories</span>
            </button>
          </div>
          
          <div className="v-dash-sidebar-footer">
            <div className="v-dash-help-section">
              <h4>Need Help?</h4>
              <p>Contact shelter administration</p>
              <button className="v-dash-help-btn">Get Support</button>
            </div>
            <button className="v-dash-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="v-dash-main">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome back, {userData.name || 'User'}! Here's what's happening today.</p>
              </div>
              
              <div className="v-dash-stats-grid">
                <div className="v-dash-stat-card">
                  <div className="v-dash-stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="v-dash-stat-info">
                    <h3>{dashboardData?.statistics?.volunteerHours || 0} hours</h3>
                    <p>Total Volunteered</p>
                  </div>
                </div>
                
                <div className="v-dash-stat-card">
                  <div className="v-dash-stat-icon">
                    <PawPrint size={24} />
                  </div>
                  <div className="v-dash-stat-info">
                    <h3>{dashboardData?.assignedDogs?.length || 0} dogs</h3>
                    <p>Under Your Care</p>
                  </div>
                </div>
                
                <div className="v-dash-stat-card">
                  <div className="v-dash-stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="v-dash-stat-info">
                    <h3>{dashboardData?.statistics?.completedTasks || 0} tasks</h3>
                    <p>Completed This Month</p>
                  </div>
                </div>
                
                <div className="v-dash-stat-card">
                  <div className="v-dash-stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="v-dash-stat-info">
                    <h3>{dashboardData?.statistics?.totalDistance?.toFixed(1) || 0} km</h3>
                    <p>Total Walked</p>
                  </div>
                </div>
              </div>
              
              <div className="v-dash-overview-actions">
                <h3>Quick Actions</h3>
                <div className="v-dash-action-buttons">
                  <button 
                    className="v-dash-action-btn"
                    onClick={() => setActiveSection('health')}
                  >
                    <Plus size={18} />
                    <span>Submit Health Report</span>
                  </button>
                  
                  <button 
                    className="v-dash-action-btn"
                    onClick={() => setActiveSection('walks')}
                  >
                    <MapPin size={18} />
                    <span>Log a Walk</span>
                  </button>
                  
                  <button 
                    className="v-dash-action-btn"
                    onClick={() => {
                      setActiveSection('blog');
                      setShowNewPostForm(true);
                    }}
                  >
                    <Edit3 size={18} />
                    <span>Write Blog Post</span>
                  </button>
                  
                  <button 
                    className="v-dash-action-btn"
                    onClick={handleDownloadReport}
                  >
                    <Download size={18} />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
              
              <div className="v-dash-upcoming-tasks">
                <h3>Upcoming Tasks</h3>
                <div className="v-dash-task-list">
                  {dashboardData?.upcomingTasks?.map(task => (
                    <div key={task._id} className="v-dash-task-item">
                      <div className="v-dash-task-info">
                        <img src={task.dogId?.photo || 'https://placedog.net/300/300?id=1'} alt={task.dogId?.name || 'Dog'} className="v-dash-task-dog-img" />
                        <div>
                          <h4>{task.dogId?.name || 'Unknown Dog'} - {task.taskType}</h4>
                          <p>{new Date(task.scheduledTime).toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        className="v-dash-task-complete-btn"
                        onClick={() => markTaskComplete(task._id)}
                      >
                        Mark Complete
                      </button>
                    </div>
                  )) || <p>No upcoming tasks</p>}
                </div>
              </div>
            </section>
          )}
          
          {/* Tasks & Care Section */}
          {activeSection === 'tasks' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  🐕 Assigned Dogs & Tasks
                </h2>
                <p style={{ 
                  fontSize: '1.1rem', 
                  color: '#64748b',
                  fontWeight: '400'
                }}>
                  Manage your daily tasks and care routines with love
                </p>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
                gap: '24px',
                marginTop: '32px'
              }}>
                {assignedTasks.length > 0 ? assignedTasks.map(dogGroup => (
                  <div 
                    key={dogGroup.dog._id} 
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {/* Decorative gradient overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                    }} />
                    
                    {/* Dog Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={dogGroup.dog.photo ? `http://localhost:3000/uploads/dogs/${dogGroup.dog.photo}` : 'https://placedog.net/300/300?id=1'} 
                          alt={dogGroup.dog.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #ffffff',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '24px',
                          height: '24px',
                          backgroundColor: dogGroup.dog.healthStatus?.toLowerCase() === 'healthy' ? '#10b981' : '#f59e0b',
                          borderRadius: '50%',
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0'
                        }}>
                          {dogGroup.dog.name}
                        </h3>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          backgroundColor: dogGroup.dog.healthStatus?.toLowerCase() === 'healthy' ? '#dcfdf7' : '#fef3c7',
                          color: dogGroup.dog.healthStatus?.toLowerCase() === 'healthy' ? '#059669' : '#d97706',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: dogGroup.dog.healthStatus?.toLowerCase() === 'healthy' ? '#10b981' : '#f59e0b'
                          }} />
                          {dogGroup.dog.healthStatus || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tasks Section */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        📋 Active Tasks
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {dogGroup.tasks.map((task) => (
                          <div 
                            key={task._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              backgroundColor: task.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                              borderRadius: '12px',
                              border: `2px solid ${task.status === 'completed' ? '#bbf7d0' : '#e2e8f0'}`,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span style={{
                              fontSize: '0.95rem',
                              fontWeight: '500',
                              color: task.status === 'completed' ? '#166534' : '#475569'
                            }}>
                              {task.taskType}
                            </span>
                            {task.status === 'pending' ? (
                              <button 
                                onClick={() => markTaskComplete(task._id)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                              >
                                ✓ Complete
                              </button>
                            ) : (
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                ✓ Done
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Next Task */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⏰ Next Task
                      </h4>
                      <p style={{ 
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        margin: 0,
                        padding: '8px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        {dogGroup.tasks[0] ? new Date(dogGroup.tasks[0].scheduledTime).toLocaleString() : 'No scheduled tasks'}
                      </p>
                    </div>
                    
                    {/* Recent Health */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        💊 Recent Health
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {Array.isArray(healthReports) && healthReports
                          .filter(r => getReportDogId(r) === dogGroup.dog._id)
                          .sort((a,b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
                          .slice(0, 3)
                          .map((r) => (
                          <div 
                            key={r._id} 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              backgroundColor: '#fefefe',
                              borderRadius: '8px',
                              border: '1px solid #f1f5f9'
                            }}
                          >
                            <span style={{ 
                              fontSize: '0.8rem', 
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              {new Date(r.date || r.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {r.eatingHabits && (
                                <span style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#dbeafe',
                                  color: '#3b82f6',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  E: {r.eatingHabits}
                                </span>
                              )}
                              {r.mood && (
                                <span style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#fef3c7',
                                  color: '#f59e0b',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  M: {r.mood}
                                </span>
                              )}
                              {r.weight && (
                                <span style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#ecfdf5',
                                  color: '#10b981',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  {r.weight}kg
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {!(Array.isArray(healthReports) && healthReports.filter(r => getReportDogId(r) === dogGroup.dog._id).length > 0) && (
                          <p style={{ 
                            fontSize: '0.85rem',
                            color: '#9ca3af',
                            margin: 0,
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: '12px'
                          }}>
                            No recent health reports
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => openHealthReportModal(dogGroup.dog)}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      📝 Submit Health Report
                    </button>
                  </div>
                )) : (
                  (
                    (dashboardData?.assignedDogs && dashboardData.assignedDogs.length > 0
                      ? dashboardData.assignedDogs
                      : availableDogs
                    ) || []
                  ).map((dog) => (
                    <div 
                      key={dog._id} 
                      style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        opacity: 0.8
                      }}
                    >
                      {/* Decorative gradient overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)'
                      }} />
                      
                      {/* Dog Header */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={dog.photo ? `http://localhost:3000/uploads/dogs/${dog.photo}` : dog.imageUrl || 'https://placedog.net/300/300?id=1'} 
                            alt={dog.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '4px solid #ffffff',
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#9ca3af',
                            borderRadius: '50%',
                            border: '3px solid white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 4px 0'
                          }}>
                            {dog.name}
                          </h3>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#9ca3af'
                            }} />
                            No tasks assigned
                          </div>
                        </div>
                      </div>

                      {/* Recent Health */}
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          💊 Recent Health
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {Array.isArray(healthReports) && healthReports
                            .filter(r => getReportDogId(r) === dog._id)
                            .sort((a,b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
                            .slice(0, 3)
                            .map((r) => (
                            <div 
                              key={r._id} 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                backgroundColor: '#fefefe',
                                borderRadius: '8px',
                                border: '1px solid #f1f5f9'
                              }}
                            >
                              <span style={{ 
                                fontSize: '0.8rem', 
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                {new Date(r.date || r.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {r.eatingHabits && (
                                  <span style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#dbeafe',
                                    color: '#3b82f6',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600'
                                  }}>
                                    E: {r.eatingHabits}
                                  </span>
                                )}
                                {r.mood && (
                                  <span style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#fef3c7',
                                    color: '#f59e0b',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600'
                                  }}>
                                    M: {r.mood}
                                  </span>
                                )}
                                {r.weight && (
                                  <span style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#ecfdf5',
                                    color: '#10b981',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600'
                                  }}>
                                    {r.weight}kg
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {!(Array.isArray(healthReports) && healthReports.filter(r => getReportDogId(r) === dog._id).length > 0) && (
                            <p style={{ 
                              fontSize: '0.85rem',
                              color: '#9ca3af',
                              margin: 0,
                              fontStyle: 'italic',
                              textAlign: 'center',
                              padding: '12px'
                            }}>
                              No recent health reports
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => openHealthReportModal(dog)}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(156, 163, 175, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        📝 Submit Health Report
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* NEW: Volunteer Management Section */}
          {activeSection === 'volunteer-management' && renderVolunteerManagement()}
          
          {/* Health Reports Section */}
          {activeSection === 'health' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2>Health Reporting</h2>
                <p>Submit health reports for dogs under your care</p>
              </div>
              
              {assignedTasks.length > 0 ? (
                <div className="v-dash-health-grid">
                  {assignedTasks.map(dogGroup => (
                    <div key={dogGroup.dog._id} className="v-dash-health-card">
                      <div className="v-dash-health-header">
                        <img src={dogGroup.dog.photo ? `http://localhost:3000/uploads/dogs/${dogGroup.dog.photo}` : 'https://placedog.net/300/300?id=1'} alt={dogGroup.dog.name} />
                        <h3>{dogGroup.dog.name}</h3>
                        <span className={`status-indicator ${dogGroup.dog.healthStatus?.toLowerCase().replace(' ', '-')}`}>{dogGroup.dog.healthStatus || 'Unknown'}</span>
                      </div>
                      
                      <button 
                        className="v-dash-primary-btn"
                        onClick={() => openHealthReportModal(dogGroup.dog)}
                      >
                        Submit Health Report
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="v-dash-health-card" style={{ maxWidth: '720px', margin: '0 auto' }}>
                  <div className="v-dash-health-header">
                    <Heart size={24} />
                    <h3>General Health Report</h3>
                  </div>

                  <div className="v-dash-health-form">
                    <div className="v-dash-form-group">
                      <label>Select Dog</label>
                      <select 
                        value={healthReport.dogId}
                        onChange={(e) => setHealthReport({ ...healthReport, dogId: e.target.value })}
                        className="v-dash-dog-dropdown"
                      >
                        <option value="">Choose a dog</option>
                        {(dashboardData?.assignedDogs?.length ? dashboardData.assignedDogs : availableDogs)?.map((dog) => (
                          <option key={dog._id} value={dog._id}>{dog.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="v-dash-form-group">
                      <label>Eating Habits</label>
                      <select 
                        value={healthReport.eatingHabits}
                        onChange={(e) => setHealthReport({...healthReport, eatingHabits: e.target.value})}
                      >
                        <option value="normal">Normal</option>
                        <option value="reduced">Reduced</option>
                        <option value="increased">Increased</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    <div className="v-dash-form-group">
                      <label>Mood/Behavior</label>
                      <select 
                        value={healthReport.mood}
                        onChange={(e) => setHealthReport({...healthReport, mood: e.target.value})}
                      >
                        <option value="playful">Playful</option>
                        <option value="quiet">Quiet</option>
                        <option value="anxious">Anxious</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="depressed">Depressed</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>

                    <div className="v-dash-form-group">
                      <label>Weight (kg)</label>
                      <input 
                        type="number" 
                        value={healthReport.weight}
                        onChange={(e) => setHealthReport({...healthReport, weight: e.target.value})}
                        placeholder="Enter weight"
                      />
                    </div>

                    <div className="v-dash-form-group">
                      <label>Observations</label>
                      <textarea 
                        value={healthReport.observations}
                        onChange={(e) => setHealthReport({...healthReport, observations: e.target.value})}
                        placeholder="Enter any observations here..."
                        rows="3"
                      />
                    </div>

                    <div className="v-dash-form-group">
                      <label>Upload Photos</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                          type="button"
                          className="v-dash-secondary-btn"
                          onClick={() => document.getElementById('health-photo-input').click()}
                          style={{ 
                            padding: '12px 16px', 
                            border: '2px dashed #ccc', 
                            backgroundColor: '#f9f9f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Upload size={18} />
                          <span>Choose Photos</span>
                        </button>
                        
                        <input 
                          id="health-photo-input"
                          type="file" 
                          accept="image/*" 
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => setHealthReport({...healthReport, photos: Array.from(e.target.files || [])})}
                        />
                        
                        {Array.isArray(healthReport.photos) && healthReport.photos.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
                              {healthReport.photos.length} photo(s) selected:
                            </small>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {healthReport.photos.map((file, index) => (
                                <span 
                                  key={index} 
                                  style={{ 
                                    padding: '4px 8px', 
                                    backgroundColor: '#e3f2fd', 
                                    borderRadius: '4px', 
                                    fontSize: '12px',
                                    color: '#1976d2'
                                  }}
                                >
                                  {file.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      className="v-dash-primary-btn"
                      onClick={() => handleHealthReportSubmit(healthReport.dogId)}
                      disabled={!healthReport.dogId}
                      style={{ marginTop: '16px', width: '100%' }}
                    >
                      Submit Health Report
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
          
          {/* Walking Tracker Section */}
          {activeSection === 'walks' && (
            <section className="v-dash-section">
              {loading ? (
                <div className="v-dash-loading">
                  <p>Loading walking data...</p>
                </div>
              ) : (
                <>
                  <div className="v-dash-section-header">
                    <h2>Walking Tracker</h2>
                    <p>Log and track your dog walking activities</p>
                  </div>
                  
                  <div className="v-dash-walk-stats">
                    <div className="v-dash-walk-stat">
                      <h3>{walkingData?.totalDistance !== undefined ? walkingData.totalDistance.toFixed(1) : '0.0'} km</h3>
                      <p>Total Distance</p>
                    </div>
                    
                    <div className="v-dash-walk-stat">
                      <h3>{walkingData?.totalDuration || '0h 0m'}</h3>
                      <p>Total Time</p>
                    </div>
                    
                    <div className="v-dash-walk-stat">
                      <h3>{walkingData?.uniqueDogs || 0}</h3>
                      <p>Dogs Walked</p>
                    </div>
                    
                    <div className="v-dash-walk-stat">
                      <h3>{walkingData?.statistics?.totalWalks || walkingData?.walks?.length || 0}</h3>
                      <p>Total Walks</p>
                    </div>
                  </div>
              
              <div className="v-dash-walk-log">
                <h3>Log a New Walk</h3>
                <div className="v-dash-walk-form">
                  {/* Dog Selection */}
                  <div className="v-dash-form-group">
                    <label>Select Dog</label>
                    <select 
                      value={walkLog.dogId} 
                      onChange={(e) => setWalkLog({...walkLog, dogId: e.target.value})}
                      className="v-dash-dog-dropdown"
                    >
                      <option value="">Choose a dog</option>
                      {availableDogs.map(dog => (
                        <option key={dog._id} value={dog._id}>
                          {dog.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="v-dash-form-row">
                    <div className="v-dash-form-group">
                      <label>Date</label>
                      <input 
                        type="date" 
                        value={walkLog.walkDate}
                        onChange={(e) => setWalkLog({...walkLog, walkDate: e.target.value})}
                      />
                    </div>
                    
                    <div className="v-dash-form-group">
                      <label>Time</label>
                      <input 
                        type="time" 
                        value={walkLog.walkTime}
                        onChange={(e) => setWalkLog({...walkLog, walkTime: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="v-dash-form-row">
                    <div className="v-dash-form-group">
                      <label>Distance (km)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={walkLog.distance}
                        onChange={(e) => setWalkLog({...walkLog, distance: e.target.value})}
                        placeholder="0.0"
                      />
                    </div>
                    
                    <div className="v-dash-form-group">
                      <label>Duration (minutes)</label>
                      <input 
                        type="number" 
                        value={walkLog.duration}
                        onChange={(e) => setWalkLog({...walkLog, duration: e.target.value})}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="v-dash-form-group">
                    <label>Route/Location</label>
                    <input 
                      type="text" 
                      value={walkLog.route}
                      onChange={(e) => setWalkLog({...walkLog, route: e.target.value})}
                      placeholder="e.g., Park trail, neighborhood streets..."
                    />
                  </div>

                  <div className="v-dash-form-row">
                    <div className="v-dash-form-group">
                      <label>Weather</label>
                      <select 
                        value={walkLog.weather}
                        onChange={(e) => setWalkLog({...walkLog, weather: e.target.value})}
                      >
                        <option value="">Select weather</option>
                        <option value="sunny">Sunny</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="rainy">Rainy</option>
                        <option value="snowy">Snowy</option>
                        <option value="windy">Windy</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="v-dash-form-group">
                      <label>Walk Quality</label>
                      <select 
                        value={walkLog.walkQuality}
                        onChange={(e) => setWalkLog({...walkLog, walkQuality: e.target.value})}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>

                  <div className="v-dash-form-group">
                    <label>Dog Behavior</label>
                    <select 
                      value={walkLog.dogBehavior}
                      onChange={(e) => setWalkLog({...walkLog, dogBehavior: e.target.value})}
                    >
                      <option value="calm">Calm</option>
                      <option value="excited">Excited</option>
                      <option value="anxious">Anxious</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="playful">Playful</option>
                      <option value="tired">Tired</option>
                    </select>
                  </div>
                  
                  <div className="v-dash-form-group">
                    <label>Activities</label>
                    <div className="v-dash-checkbox-group">
                      <label className="v-dash-checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={walkLog.activities.includes('exercise')}
                          onChange={(e) => {
                            const activities = [...walkLog.activities];
                            if (e.target.checked) {
                              activities.push('exercise');
                            } else {
                              const index = activities.indexOf('exercise');
                              if (index > -1) activities.splice(index, 1);
                            }
                            setWalkLog({...walkLog, activities});
                          }}
                        />
                        <span>Exercise</span>
                      </label>
                      
                      <label className="v-dash-checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={walkLog.activities.includes('play')}
                          onChange={(e) => {
                            const activities = [...walkLog.activities];
                            if (e.target.checked) {
                              activities.push('play');
                            } else {
                              const index = activities.indexOf('play');
                              if (index > -1) activities.splice(index, 1);
                            }
                            setWalkLog({...walkLog, activities});
                          }}
                        />
                        <span>Play</span>
                      </label>
                      
                      <label className="v-dash-checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={walkLog.activities.includes('training')}
                          onChange={(e) => {
                            const activities = [...walkLog.activities];
                            if (e.target.checked) {
                              activities.push('training');
                            } else {
                              const index = activities.indexOf('training');
                              if (index > -1) activities.splice(index, 1);
                            }
                            setWalkLog({...walkLog, activities});
                          }}
                        />
                        <span>Training</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="v-dash-form-group">
                    <label>Notes</label>
                    <textarea 
                      value={walkLog.notes}
                      onChange={(e) => setWalkLog({...walkLog, notes: e.target.value})}
                      placeholder="Any observations during the walk..."
                    ></textarea>
                  </div>
                  
                  <button 
                    className="v-dash-primary-btn"
                    onClick={handleWalkLog}
                  >
                    Log Walk
                  </button>
                </div>
              </div>
              
              <div className="v-dash-walk-history">
                <h3>Recent Walks</h3>
                <div className="v-dash-walk-list">
                  {walkingData?.recentWalks?.length > 0 ? walkingData.recentWalks.map(walk => (
                    <div key={walk._id} className="v-dash-walk-item">
                      <img 
                        src={
                          walk.dog?.photo
                            ? `http://localhost:3000/uploads/dogs/${walk.dog.photo}`
                            : 'https://placedog.net/300/300?id=1'
                        } 
                        alt={walk.dog?.name || 'Dog'} 
                      />
                      <div className="v-dash-walk-info">
                        <h4>{walk.dog?.name || 'Unknown Dog'}</h4>
                        <div className="v-dash-walk-details">
                          <p><strong>Distance:</strong> {typeof walk.distance === 'number' ? walk.distance.toFixed(1) : walk.distance}km</p>
                          <p><strong>Duration:</strong> {walk.duration}</p>
                          <p><strong>Date:</strong> {new Date(walk.date).toLocaleDateString()}</p>
                          {walk.route && <p><strong>Route:</strong> {walk.route}</p>}
                          {walk.weather && <p><strong>Weather:</strong> {walk.weather}</p>}
                          {walk.walkQuality && <p><strong>Quality:</strong> {walk.walkQuality}</p>}
                          {walk.dogBehavior && <p><strong>Dog Behavior:</strong> {walk.dogBehavior}</p>}
                          {walk.activities && walk.activities.length > 0 && (
                            <p><strong>Activities:</strong> {walk.activities.join(', ')}</p>
                          )}
                          {walk.notes && <p><strong>Notes:</strong> {walk.notes}</p>}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="v-dash-no-walks">No recent walks found. Start logging your walks!</p>
                  )}
                </div>
              </div>
                </>
              )}
            </section>
          )}
          
          {/* Events Section */}
          {activeSection === 'events' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2>Upcoming Events</h2>
                <p>Participate in shelter events and activities</p>
              </div>
              
              <div className="v-dash-events-grid">
                {events.map(event => (
                  <div key={event._id} className="v-dash-event-card">
                    <div className="v-dash-event-header">
                      <h3>{event.title}</h3>
                      <div className={`v-dash-event-status ${event.attendees?.includes(userData?.id) ? 'confirmed' : 'pending'}`}>
                        {event.attendees?.includes(userData?.id) ? 'Confirmed' : 'Not RSVPed'}
                      </div>
                    </div>
                    
                    <div className="v-dash-event-details">
                      <p><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</p>
                      <p><Clock size={16} /> {new Date(event.date).toLocaleTimeString()}</p>
                      <p><MapPin size={16} /> {event.location}</p>
                     
                    </div>
                    
                    <div className="v-dash-event-actions">
                     
                      
                      <button 
                        className="v-dash-calendar-btn"
                        onClick={() => {
                          // Add event to calendar and navigate
                          const calendarEvent = {
                            id: event._id,
                            title: event.title,
                            date: event.date,
                            location: event.location,
                            type: event.eventType || 'shelter',
                            description: event.description || ''
                          };
                          
                          try {
                            // Get existing calendar events
                            const existingEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
                            
                            // Check if event is already in calendar
                            const isAlreadyAdded = existingEvents.some(e => e.id === event._id);
                            
                            if (!isAlreadyAdded) {
                              // Add new event to calendar
                              const updatedEvents = [...existingEvents, calendarEvent];
                              localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
                            }
                            
                            // Navigate to calendar
                            window.location.href = '/eventcalendar';
                            
                          } catch (error) {
                            console.error('Error adding event to calendar:', error);
                            alert('Added to calendar! Navigating...');
                            window.location.href = '/eventcalendar';
                          }
                        }}
                      >
                        <CalendarDays size={16} />
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {events.length === 0 && (
                <div className="v-dash-no-events">
                  <p>No upcoming events found.</p>
                  <button 
                    className="v-dash-primary-btn"
                    onClick={() => window.location.href = '/events'}
                  >
                    Browse All Events
                  </button>
                </div>
              )}
              
              <div className="v-dash-past-events">
                <h3>Past Events</h3>
                <div className="v-dash-past-events-list">
                  <div className="v-dash-past-event">
                    <h4>Charity Fundraiser</h4>
                    <p>October 5, 2023 • Raised $2,400</p>
                  </div>
                  <div className="v-dash-past-event">
                    <h4>Community Awareness Day</h4>
                    <p>September 18, 2023 • 120 attendees</p>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Blog Section */}
          {activeSection === 'blog' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2>Blog & Story Contributions</h2>
                <p>Share stories about your experiences with the shelter dogs</p>
              </div>
              
              <button 
                className="v-dash-primary-btn new-post-btn"
                onClick={() => {
                  setShowNewPostForm(!showNewPostForm);
                  setNewBlogPost({ title: '', content: '' }); // Reset form when opening
                }}
              >
                <Plus size={18} />
                <span>{showNewPostForm ? 'Cancel' : 'New Blog Post'}</span>
              </button>
              
              {showNewPostForm && (
                <div className="v-dash-new-post-form">
                  <h3>Create New Blog Post</h3>
                  <div className="v-dash-form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={newBlogPost.title}
                      onChange={(e) => setNewBlogPost({...newBlogPost, title: e.target.value})}
                      placeholder="Enter a title for your post"
                    />
                  </div>
                  
                  <div className="v-dash-form-group">
                    <label>Content</label>
                    <textarea 
                      value={newBlogPost.content}
                      onChange={(e) => setNewBlogPost({...newBlogPost, content: e.target.value})}
                      placeholder="Write your blog post here..."
                      rows="6"
                    ></textarea>
                  </div>
                  
                  <div className="v-dash-form-actions">
                    <button 
                      className="v-dash-secondary-btn"
                      onClick={() => {
                        setShowNewPostForm(false);
                        setNewBlogPost({ title: '', content: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="v-dash-primary-btn"
                      onClick={handleNewBlogPost}
                    >
                      <Save size={16} />
                      Submit Post
                    </button>
                  </div>
                </div>
              )}
              
              <div className="v-dash-blog-posts">
                <h3>Your Submissions</h3>
                
                {!Array.isArray(blogPosts) || blogPosts.length === 0 ? (
                  <p className="v-dash-no-posts">You haven't submitted any blog posts yet.</p>
                ) : (
                  blogPosts.map(post => (
                    <div key={post._id} className="v-dash-blog-post">
                      <div className="v-dash-post-info">
                        <h4>{post.title}</h4>
                        <p>Submitted on {new Date(post.createdAt).toLocaleDateString()}</p>
                        <p className="v-dash-post-excerpt">
                          {post.content?.substring(0, 150) || 'No content available'}...
                        </p>
                      </div>
                      
                      <div className={`v-dash-post-status ${(post.status || 'draft').toLowerCase()}`}>
                        {post.status || 'Draft'}
                      </div>
                      
                      <div className="v-dash-post-actions">
                        <button 
                          className="v-dash-edit-btn"
                          onClick={() => handleEditBlogPost(post._id)}
                          disabled={post.status === 'published'}
                          title={post.status === 'published' ? 'Published posts cannot be edited' : 'Edit post'}
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button 
                          className="v-dash-delete-btn"
                          onClick={() => handleDeleteBlogPost(post._id)}
                          disabled={post.status === 'published'}
                          title={
                            post.status === 'published' 
                              ? 'Published posts cannot be deleted' 
                              : 'Delete post'
                          }
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default VolunteerDashboard;