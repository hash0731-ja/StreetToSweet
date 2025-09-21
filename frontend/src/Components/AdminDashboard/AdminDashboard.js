import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  LogOut,
  PawPrint,
  Home,
  Calendar,
  AlertTriangle,
  Stethoscope,
  BarChart3,
  Settings,
  Bell,
  UserPlus,
  FileText,
  ClipboardList,
  MapPin,
  Heart,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Map,
  Truck,
  Shield,
  FileCheck,
  Activity,
  Clock,
  AlertCircle
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [rescueReports, setRescueReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddRescueModal, setShowAddRescueModal] = useState(false);
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [showEmergencyMap, setShowEmergencyMap] = useState(false);
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "adopter",
    status: "active"
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    attendees: 0,
    photo: null
  });
  const [newRescue, setNewRescue] = useState({
    location: "",
    reportedBy: "",
    status: "pending",
    urgency: "medium"
  });
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    age: "",
    color: "",
    tagColor: "blue",
    status: "rescue",
    healthStatus: "good",
    photo: null
  });

  useEffect(() => {
    // Fetch dashboard data from backend
    // Ensure axios sends the admin token for protected endpoints
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, usersRes, dogsRes, adoptionsRes, eventsRes, emergencyRes] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/users', { params: { page: 1, limit: 50 } }),
        axios.get('/dogs'),
        axios.get('/adoption-requests'),
        axios.get('/admin/events', { params: { page: 1, limit: 50 } }),
        axios.get('/emergency-reports', { params: { limit: 100 } })
      ]);

      const overview = dashRes.data?.data?.overview || {};
      const adoptionStats = dashRes.data?.data?.adoptionStats || {};

      const mappedEmergency = (emergencyRes.data?.data || []).map(er => ({
        id: er.id,
        location: er.address,
        reportedBy: er.reportedBy || 'Unknown',
        date: er.timestamp ? new Date(er.timestamp).toISOString().split('T')[0] : '',
        status: er.status, // pending | assigned | rescued
        urgency: (er.priority === 'Emergency' || er.priority === 'High') ? 'high' : (er.priority === 'Normal' ? 'low' : 'medium'),
        assignedTo: er.assignedDriver || ''
      }));
      setRescueReports(mappedEmergency);

      // Map dogs data first before using it in stats calculation
      const mappedDogs = (dogsRes.data || []).map(d => ({
        id: d._id,
        uniqueCode: d.id || d._id,
        name: d.name,
        breed: d.breed || 'Mixed',
        age: d.age || 'Unknown',
        tagColor: (d.badges && d.badges[0]) || 'blue',
        status: d.status === 'treatment' ? 'treatment' : (d.status === 'adoption' ? 'adoption' : (d.status === 'adopted' ? 'adopted' : 'rescue')),
        healthStatus: d.health ? d.health.toLowerCase() : (d.vaccinated ? 'good' : 'fair'),
        vaccinations: [],
        photo: d.photo || null
      }));
      setDogs(mappedDogs);

      const activeRescueCount = mappedEmergency.filter(r => r.status !== 'rescued' && r.status !== 'cancelled').length;
      const emergencyCount = mappedEmergency.filter(r => r.urgency === 'high').length;
      const adoptedDogsCount = mappedDogs.filter(d => d.status === 'adopted').length;
      const dogsInShelterCount = mappedDogs.filter(d => d.status === 'adoption' || d.status === 'treatment').length;

      setStats({
        totalDogs: overview.totalDogs || mappedDogs.length,
        adoptedDogs: adoptionStats.approved || adoptedDogsCount,
        dogsInShelter: dogsInShelterCount,
        totalVolunteers: overview.totalVolunteers || 0,
        activeRescues: activeRescueCount,
        pendingAdoptions: adoptionStats.pending || 0,
        upcomingEvents: overview.upcomingEvents || (eventsRes.data?.data?.pagination?.total || 0),
        newMessages: 0,
        totalDonations: 0,
        emergencyAlerts: emergencyCount
      });

      const mappedUsers = (usersRes.data?.data?.users || []).map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'user' ? 'adopter' : u.role,
        status: u.isActive ? 'active' : 'suspended',
        joinDate: u.createdAt ? u.createdAt.split('T')[0] : ''
      }));
      setUsers(mappedUsers);

      const mappedVolunteers = mappedUsers.filter(u => u.role === 'volunteer').map(v => ({ ...v, tasks: 0, completed: 0 }));
      setVolunteers(mappedVolunteers);

      const mappedAdoptions = (adoptionsRes.data || []).map(a => ({
        id: a._id,
        dogName: a.dog?.name || 'Unknown',
        userName: a.fullName,
        date: a.createdAt ? a.createdAt.split('T')[0] : '',
        status: a.requestStatus
      }));
      setAdoptionRequests(mappedAdoptions);

      const mappedEvents = (eventsRes.data?.data?.events || []).map(e => ({
        id: e._id,
        title: e.title,
        date: e.date ? e.date.split('T')[0] : '',
        location: e.location,
        attendees: e.registeredVolunteers ? e.registeredVolunteers.length : 0,
        status: e.status || 'upcoming',
        photo: (e.photos && e.photos[0]) || null
      }));
      setEvents(mappedEvents);

      const activities = [];
      mappedAdoptions.slice(0, 3).forEach((r, i) => activities.push({ id: `adopt-${i}`, type: 'adoption', message: `Adoption ${r.status} for ${r.dogName}`, time: r.date, user: r.userName }));
      mappedEmergency.slice(0, 3).forEach((r, i) => activities.push({ id: `rescue-${i}`, type: 'rescue', message: `Emergency ${r.status} in ${r.location}`, time: r.date, user: r.reportedBy }));
      setRecentActivities(activities);

      const pending = [];
      if ((adoptionStats.pending || 0) > 0) pending.push({ id: 1, type: 'adoption', title: 'Adoption Request Approval', description: `${adoptionStats.pending} requests pending review`, priority: 'high' });
      if (activeRescueCount > 0) pending.push({ id: 2, type: 'rescue', title: 'Rescue Assignment', description: `${activeRescueCount} active emergencies`, priority: 'medium' });
      setPendingActions(pending);

      const alerts = mappedEmergency.filter(r => r.urgency === 'high').map((r, i) => ({ id: r.id || i, type: 'injured', location: r.location, reportedBy: r.reportedBy, time: r.date, status: r.assignedTo ? 'assigned' : 'new' }));
      setEmergencyAlerts(alerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleApprove = async (id, type) => {
    if (type !== 'adoption') return;
    try {
      // Persist to backend (admin only)
      const res = await axios.post(`/adoption-requests/${id}/approve`, { note: '' });
      const updated = res.data;
      setAdoptionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      // keep dashboard stats roughly in sync
      setStats(prev => ({
        ...prev,
        pendingAdoptions: Math.max(0, (prev.pendingAdoptions || 0) - 1),
        adoptedDogs: (prev.adoptedDogs || 0) + 1 // increment adopted count
      }));
      // optional: refresh dashboard data to reflect server truth
      fetchDashboardData();
    } catch (e) {
      console.error('Approve adoption failed', e);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message;
      alert(`Approve failed: ${msg}`);
    }
    
  };

  const handleReject = async (id, type) => {
    if (type !== 'adoption') return;
    try {
      // Persist to backend (admin only)
      const res = await axios.post(`/adoption-requests/${id}/reject`, { note: '' });
      const updated = res.data;
      setAdoptionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      // keep dashboard stats roughly in sync
      setStats(prev => ({
        ...prev,
        pendingAdoptions: Math.max(0, (prev.pendingAdoptions || 0) - 1)
      }));
      // optional: refresh dashboard data to reflect server truth
      fetchDashboardData();
    } catch (e) {
      console.error('Reject adoption failed', e);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message;
      alert(`Reject failed: ${msg}`);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'user') {
        await axios.delete(`/admin/users/${id}`);
        setUsers(prev => prev.filter(user => user.id !== id));
        // If we deleted a volunteer user, also remove from volunteers list
        setVolunteers(prev => prev.filter(v => v.id !== id));
      } else if (type === 'event') {
        await axios.delete(`/admin/events/${id}`);
        setEvents(prev => prev.filter(event => event.id !== id));
      } else if (type === 'rescue') {
        await axios.delete(`/emergency-reports/${id}`);
        setRescueReports(prev => prev.filter(report => report.id !== id));
      } else if (type === 'dog') {
        await axios.delete(`/dogs/${id}`);
        setDogs(prev => prev.filter(dog => dog.id !== id));
      } else if (type === 'alert') {
        setEmergencyAlerts(prev => prev.filter(alert => alert.id !== id));
      } else if (type === 'adoption') {
        await axios.delete(`/adoption-requests/${id}`);
        setAdoptionRequests(prev => prev.filter(req => req.id !== id));
      } else if (type === 'volunteer') {
        // Volunteers are represented from users; delete the underlying user
        await axios.delete(`/admin/users/${id}`);
        setVolunteers(prev => prev.filter(vol => vol.id !== id));
        setUsers(prev => prev.filter(user => user.id !== id));
      }
    } catch (e) {
      console.error('Delete failed', e);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message;
      alert(`Delete failed: ${msg}`);
    }
  };

  // Assign an emergency report (optional: pass driverId if available)
  const handleAssignEmergency = async (id, driverId = null) => {
    try {
      const payload = driverId ? { status: 'assigned', driverId } : { status: 'assigned' };
      await axios.put(`/emergency-reports/${id}/status`, payload);
      setRescueReports(prev => prev.map(r => r.id === id ? { ...r, status: 'assigned', assignedTo: r.assignedTo || '' } : r));
    } catch (e) {
      console.error('Assign emergency failed', e);
      alert('Failed to assign emergency report');
    }
  };

  const handleMarkAdoptionReady = async (id) => {
    try {
      await axios.put(`/dogs/${id}`, { status: 'adoption' });
      setDogs(prev => prev.map(d => d.id === id ? { ...d, status: 'adoption' } : d));
    } catch (e) {
      console.error('Update dog failed', e);
    }
  };

  const handleGenerateCertificate = (id) => {
    navigate(`/adoption-certificate/${id}`);
  };

  const handleAddUser = async () => {
    try {
      const payload = { name: newUser.name, email: newUser.email, role: newUser.role === 'adopter' ? 'user' : newUser.role, isActive: newUser.status !== 'suspended' };
      const res = await axios.post('/admin/users', payload);
      const u = res.data?.data?.user;
      const mapped = {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'user' ? 'adopter' : u.role,
        status: u.isActive ? 'active' : 'suspended',
        joinDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [mapped, ...prev]);
      setShowAddUserModal(false);
      setNewUser({ name: "", email: "", role: "adopter", status: "active" });
    } catch (e) {
      console.error('Add user failed', e);
    }
  };
  // Navigation functions
  const navigateToEmergencyDashboard = () => {
    navigate('/emergency-dashboard');
  };

  const navigateToRescueDashboard = () => {
    navigate('/rescue-dashboard');
  };

  const navigateToReports = () => {
    navigate('/myreports');
  };
  

  const handleAddEvent = async () => {
    try {
      // If an image is provided, send multipart/form-data with field name 'photo'
      let res;
      if (newEvent.photo) {
        const form = new FormData();
        form.append('title', newEvent.title);
        form.append('date', newEvent.date);
        form.append('location', newEvent.location);
        // required/optional backend fields with sensible defaults
        form.append('description', 'N/A');
        form.append('eventType', 'other');
        form.append('startTime', '09:00');
        form.append('endTime', '17:00');
        form.append('maxVolunteers', '10');
        form.append('requirements', '');
        form.append('photo', newEvent.photo);
        res = await axios.post('/admin/events', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const payload = { 
          title: newEvent.title, 
          date: newEvent.date, 
          location: newEvent.location,
          description: 'N/A',
          eventType: 'other',
          startTime: '09:00',
          endTime: '17:00',
          maxVolunteers: 10,
          requirements: ''
        };
        res = await axios.post('/admin/events', payload);
      }
      const e = res.data?.data?.event || res.data?.data; // tolerate shape
      const cover = (e.photos && e.photos[0]) || null;
      const mapped = { id: e._id, title: e.title, date: e.date ? e.date.split('T')[0] : newEvent.date, location: e.location, attendees: e.registeredVolunteers?.length || 0, status: e.status || 'upcoming', photo: cover };
      setEvents(prev => [mapped, ...prev]);
      setShowAddEventModal(false);
      setNewEvent({ title: "", date: "", location: "", attendees: 0, photo: null });
    } catch (e) {
      console.error('Add event failed', e);
      const msg = e.response?.data?.message || e.message || 'Failed to add event';
      alert(`Add event failed: ${msg}`);
    }
  };

  const handleAddRescue = async () => {
    try {
      const payload = { description: 'Admin created rescue', location: newRescue.location, urgency: newRescue.urgency, reporterName: newRescue.reportedBy || 'Admin', reporterPhone: 'Not provided' };
      const res = await axios.post('/rescue-requests', payload);
      const r = res.data?.data;
      const mapped = { id: r._id, location: r.location?.address || newRescue.location, reportedBy: r.reporter?.name || newRescue.reportedBy, date: r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0], status: 'pending', urgency: (newRescue.urgency || 'medium'), assignedTo: '' };
      setRescueReports(prev => [mapped, ...prev]);
      setShowAddRescueModal(false);
      setNewRescue({ location: "", reportedBy: "", status: "pending", urgency: "medium" });
    } catch (e) {
      console.error('Add rescue failed', e);
    }
  };

  const handleAddDog = async () => {
    try {
      const unique = `DOG-${Math.floor(1000 + Math.random() * 9000)}`;
      const status = newDog.status === 'treatment' ? 'treatment' : (newDog.status === 'adoption' ? 'adoption' : (newDog.status === 'adopted' ? 'adopted' : 'treatment'));
      
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('id', unique);
      formData.append('name', newDog.name);
      formData.append('age', newDog.age);
      formData.append('breed', newDog.breed);
      formData.append('status', status);
      formData.append('healthStatus', newDog.healthStatus);
      formData.append('badges', JSON.stringify([newDog.tagColor]));
      
      if (newDog.photo) {
        formData.append('photo', newDog.photo);
      }
      
      // Use the new endpoint that handles images
      const endpoint = newDog.photo ? '/dogs/with-image' : '/dogs';
      const config = newDog.photo ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {};
      
      const payload = newDog.photo ? formData : { 
        id: unique, 
        name: newDog.name, 
        age: newDog.age, 
        breed: newDog.breed, 
        status, 
        healthStatus: newDog.healthStatus, 
        badges: [newDog.tagColor] 
      };
      
      const res = await axios.post(endpoint, payload, config);
      const d = res.data;
      const mapped = { 
        id: d._id, 
        uniqueCode: d.id || unique, 
        name: d.name, 
        breed: d.breed || 'Mixed', 
        age: d.age || 'Unknown', 
        tagColor: (d.badges && d.badges[0]) || newDog.tagColor, 
        status: d.status === 'treatment' ? 'treatment' : (d.status === 'adoption' ? 'adoption' : (d.status === 'adopted' ? 'adopted' : 'rescue')), 
        healthStatus: d.healthStatus ? d.healthStatus.toLowerCase() : 'good', 
        vaccinations: [],
        photo: d.photo || null
      };
      setDogs(prev => [mapped, ...prev]);
      setShowAddDogModal(false);
      setNewDog({ name: "", breed: "", age: "", color: "", tagColor: "blue", status: "rescue", healthStatus: "good", photo: null });
    } catch (e) {
      console.error('Add dog failed', e);
      alert('Failed to register dog. Please try again.');
    }
  };

  // Mark an emergency report as completed (rescued)
  const handleCompleteEmergency = async (id) => {
    try {
      await axios.put(`/emergency-reports/${id}/status`, { status: 'rescued' });
      setRescueReports(prev => prev.map(r => r.id === id ? { ...r, status: 'rescued' } : r));
    } catch (e) {
      console.error('Complete emergency failed', e);
      alert('Failed to mark as completed');
    }
  };

  const renderAddUserModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Add New User</h3>
          <button onClick={() => setShowAddUserModal(false)}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Enter user name"
            />
          </div>
          <div className="admin-form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="Enter user email"
            />
          </div>
          <div className="admin-form-group">
            <label>Role</label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="adopter">Adopter</option>
              <option value="volunteer">Volunteer</option>
              <option value="vet">Veterinarian</option>
              <option value="driver">Rescue Driver</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select 
              value={newUser.status}
              onChange={(e) => setNewUser({...newUser, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowAddUserModal(false)}>Cancel</button>
          <button className="admin-btn primary" onClick={handleAddUser}>Add User</button>
        </div>
      </div>
    </div>
  );

  const renderAddEventModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Add New Event</h3>
          <button onClick={() => setShowAddEventModal(false)}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Event Title</label>
            <input 
              type="text" 
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              placeholder="Enter event title"
            />
          </div>
          <div className="admin-form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={newEvent.date}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label>Location</label>
            <input 
              type="text" 
              value={newEvent.location}
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              placeholder="Enter event location"
            />
          </div>
          <div className="admin-form-group">
            <label>Expected Attendees</label>
            <input 
              type="number" 
              value={newEvent.attendees}
              onChange={(e) => setNewEvent({...newEvent, attendees: parseInt(e.target.value) || 0})}
              placeholder="Enter number of attendees"
            />
          </div>
          <div className="admin-form-group">
            <label>Event Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewEvent({ ...newEvent, photo: e.target.files && e.target.files[0] })}
            />
            {newEvent.photo && (
              <div className="image-preview" style={{ marginTop: '10px' }}>
                <img
                  src={URL.createObjectURL(newEvent.photo)}
                  alt="Event preview"
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowAddEventModal(false)}>Cancel</button>
          <button className="admin-btn primary" onClick={handleAddEvent}>Add Event</button>
        </div>
      </div>
    </div>
  );

  const renderAddRescueModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Add New Rescue Report</h3>
          <button onClick={() => setShowAddRescueModal(false)}>×</button>
        </div>
        
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Location</label>
            <input 
              type="text" 
              value={newRescue.location}
              onChange={(e) => setNewRescue({...newRescue, location: e.target.value})}
              placeholder="Enter rescue location"
            />
          </div>
          
          <div className="admin-form-group">
            <label>Reported By</label>
            <input 
              type="text" 
              value={newRescue.reportedBy}
              onChange={(e) => setNewRescue({...newRescue, reportedBy: e.target.value})}
              placeholder="Enter reporter name"
            />
          </div>
          <div className="admin-form-group">
            <label>Urgency</label>
            <select 
              value={newRescue.urgency}
              onChange={(e) => setNewRescue({...newRescue, urgency: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select 
              value={newRescue.status}
              onChange={(e) => setNewRescue({...newRescue, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowAddRescueModal(false)}>Cancel</button>
          <button className="admin-btn primary" onClick={handleAddRescue}>Add Rescue Report</button>
        </div>
      </div>
    </div>
  );

   const renderAddDogModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Register New Rescued Dog</h3>
          <button onClick={() => setShowAddDogModal(false)}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={newDog.name}
              onChange={(e) => setNewDog({...newDog, name: e.target.value})}
              placeholder="Enter dog name"
            />
          </div>
          <div className="admin-form-group">
            <label>Breed</label>
            <input 
              type="text" 
              value={newDog.breed}
              onChange={(e) => setNewDog({...newDog, breed: e.target.value})}
              placeholder="Enter breed"
            />
          </div>
          <div className="admin-form-group">
            <label>Age</label>
            <input 
              type="text" 
              value={newDog.age}
              onChange={(e) => setNewDog({...newDog, age: e.target.value})}
              placeholder="Enter age"
            />
          </div>
          <div className="admin-form-group">
            <label>Description</label>
            <input 
              type="text" 
              value={newDog.color}
              onChange={(e) => setNewDog({...newDog, color: e.target.value})}
              placeholder="Enter description"
            />
          </div>
          <div className="admin-form-group">
            <label>Tag Color</label>
            <select 
              value={newDog.tagColor}
              onChange={(e) => setNewDog({...newDog, tagColor: e.target.value})}
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Health Status</label>
            <select 
              value={newDog.healthStatus}
              onChange={(e) => setNewDog({...newDog, healthStatus: e.target.value})}
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select 
              value={newDog.status}
              onChange={(e) => setNewDog({...newDog, status: e.target.value})}
            >
              <option value="rescue">Rescue</option>
              <option value="treatment">Treatment</option>
              <option value="adoption">Adoption Ready</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Dog Photo</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setNewDog({...newDog, photo: e.target.files[0]})}
            />
            {newDog.photo && (
              <div className="image-preview">
                <img 
                  src={URL.createObjectURL(newDog.photo)} 
                  alt="Dog preview" 
                  style={{width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px'}}
                />
              </div>
            )}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowAddDogModal(false)}>Cancel</button>
          <button className="admin-btn primary" onClick={handleAddDog}>Register Dog</button>
        </div>
      </div>
    </div>
  );


  const renderUsers = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>User Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="admin-btn primary" onClick={() => setShowAddUserModal(true)}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="admin-user-info">
                    <div className="admin-user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>
                 
                  <div className="admin-actions">
                     {/* Action buttons for each user 
                    <button className="admin-icon-btn" onClick={() => handleEdit(user.id, 'user')}>
                      <Edit size={16} />
                    </button>*/}
                    <button className="admin-icon-btn" onClick={() => handleDelete(user.id, 'user')}>
                      <Trash2 size={16} />
                    </button>
                    <button className="admin-icon-btn">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Event Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="admin-btn primary" onClick={() => setShowAddEventModal(true)}>
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Attendees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>
                  <div className="admin-event-photo">
                    {event.photo ? (
                      <img
                        src={event.photo.startsWith('http') ? event.photo : `http://localhost:3000${event.photo}`}
                        alt={event.title}
                        style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e1e1e1' }}
                      />
                    ) : (
                      <div style={{ width: '56px', height: '40px', borderRadius: '6px', background: '#f3f4f6', border: '1px solid #e1e1e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px' }}>
                        No Image
                      </div>
                    )}
                  </div>
                </td>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.location}</td>
                <td>{event.attendees}</td>
                <td>
                  <span className={`admin-status-badge ${event.status}`}>
                    {event.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {/* Action buttons for each user 
                    <button className="admin-icon-btn" onClick={() => handleEdit(event.id, 'event')}>
                      <Edit size={16} />
                    </button>*/}
                    <button className="admin-icon-btn">
                      <Eye size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleDelete(event.id, 'event')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Add this function right here:
const renderEmergencyMap = () => (
  <div className="admin-modal-overlay">
    <div className="admin-modal large">
      <div className="admin-modal-header">
        <h3>Emergency Map View</h3>
        <button onClick={() => setShowEmergencyMap(false)}>×</button>
      </div>
      <div className="admin-modal-body">
        <div className="map-container">
          <div className="map-placeholder">
            <Map size={48} />
            <p>Interactive Map with GPS Pins</p>
            <div className="map-legend">
              <div className="legend-item">
                <span className="pin high"></span>
                <span>High Urgency</span>
              </div>
              <div className="legend-item">
                <span className="pin medium"></span>
                <span>Medium Urgency</span>
              </div>
              <div className="legend-item">
                <span className="pin low"></span>
                <span>Low Urgency</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rescue-list">
          <h4>Active Rescue Reports</h4>
          {rescueReports.filter(r => r.status !== 'rescued').map(report => (
            <div key={report.id} className={`rescue-item ${report.urgency}`}>
              <div className="rescue-info">
                <h4>Report #{report.id}</h4>
                <p><MapPin size={14} /> {report.location}</p>
                <p>Reported by: {report.reportedBy}</p>
                <p>Status: <span className={`status ${report.status}`}>{report.status}</span></p>
              </div>
              <div className="rescue-actions">
                <button className="admin-btn primary" onClick={() => handleAssignEmergency(report.id)}>
                  Assign to Driver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-modal-footer">
        <button className="admin-btn" onClick={() => setShowEmergencyMap(false)}>Close</button>
      </div>
    </div>
  </div>
);

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon total-dogs">
            <PawPrint size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.totalDogs}</h3>
            <p>Total Dogs</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon adopted">
            <Heart size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.adoptedDogs}</h3>
            <p>Adopted Dogs</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon in-shelter">
            <Home size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.dogsInShelter}</h3>
            <p>Dogs in Shelter</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon volunteers">
            <Users size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.totalVolunteers}</h3>
            <p>Volunteers</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon rescues">
            <AlertTriangle size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.activeRescues}</h3>
            <p>Active Rescues</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon adoptions">
            <FileText size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.pendingAdoptions}</h3>
            <p>Pending Adoptions</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon events">
            <Calendar size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon donations">
            <Activity size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>${stats.totalDonations}</h3>
            <p>Total Donations</p>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-content">
        <div className="admin-content-row">
          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Emergency Alerts</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-alerts-list">
                  {emergencyAlerts.map(alert => (
                    <div key={alert.id} className={`admin-alert-item ${alert.status}`}>
                      <div className="admin-alert-icon">
                        <AlertCircle size={16} />
                      </div>
                      <div className="admin-alert-content">
                        <p>{alert.type.toUpperCase()} alert in {alert.location}</p>
                        <span>Reported by {alert.reportedBy} • {alert.time}</span>
                      </div>
                      <div className="admin-alert-actions">
                        <button className="admin-icon-btn" onClick={() => handleDelete(alert.id, 'alert')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Pending Actions</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-actions-list">
                  {pendingActions.map(action => (
                    <div key={action.id} className={`admin-action-item ${action.priority}`}>
                      <div className="admin-action-content">
                        <h4>{action.title}</h4>
                        <p>{action.description}</p>
                      </div>
                      <button className="admin-btn primary">Review</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-content-row">
          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Recent Activities</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-activity-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className={`admin-activity-item ${activity.type}`}>
                      <div className={`admin-activity-icon ${activity.type}`}>
                        {activity.type === 'adoption' && <FileText size={16} />}
                        {activity.type === 'rescue' && <AlertTriangle size={16} />}
                        {activity.type === 'user' && <UserPlus size={16} />}
                        {activity.type === 'event' && <Calendar size={16} />}
                        {activity.type === 'medical' && <Stethoscope size={16} />}
                      </div>
                      <div className="admin-activity-content">
                        <p>{activity.message}</p>
                        <span>By {activity.user} • {activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Upcoming Events</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-events-list">
                  {events.filter(event => event.status === 'upcoming').slice(0, 3).map(event => (
                    <div key={event.id} className="admin-event-item">
                      <div className="admin-event-date">
                        <Calendar size={16} />
                        <span>{event.date}</span>
                      </div>
                      <div className="admin-event-content">
                        <h4>{event.title}</h4>
                        <p><MapPin size={14} /> {event.location}</p>
                      </div>
                      <div className="admin-event-actions">
                        <button className="admin-icon-btn">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmergencyManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Emergency & Rescue Management</h3><br></br>
        
        <div className="admin-search-filter">
          
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search rescue reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="admin-btn primary" onClick={() => setShowAddRescueModal(true)}>
            <Plus size={16} />
            New Report
          </button>
          <button className="admin-btn secondary" onClick={() => setShowEmergencyMap(true)}>
            <Map size={16} />
            Map View
          </button>
        </div>
      </div>

      <div className="dashboard-navigation">
            <button className="dd-nav-button" onClick={navigateToEmergencyDashboard}>🚑Emergency Dashboard</button>
            <button className="dd-nav-button" onClick={navigateToRescueDashboard}>🐾Rescue Dashboard</button>
            
          </div>

          <br></br>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rescueReports.map(report => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>
                  <div className="admin-location-info">
                    <MapPin size={16} />
                    <span>{report.location}</span>
                  </div>
                </td>
                <td>{report.reportedBy}</td>
                <td>{report.date}</td>
                <td>
                  <span className={`admin-urgency-badge ${report.urgency}`}>
                    {report.urgency}
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${report.status}`}>
                    {report.status}
                  </span>
                </td>
                <td>{report.assignedTo || "Unassigned"}</td>
                <td>
                  <div className="admin-actions">
                    {/* Action buttons for each user 
                    <button className="admin-icon-btn" onClick={() => handleEdit(report.id, 'rescue')}>
                      <Edit size={16} />
                    </button>*/}
                    <button className="admin-icon-btn">
                      <Eye size={16} />
                    </button>
                    {!report.assignedTo && (
                      <button className="admin-icon-btn success" onClick={() => handleAssignEmergency(report.id)}>
                        <Truck size={16} />
                      </button>
                    )}
                    <button className="admin-icon-btn danger" onClick={() => handleDelete(report.id, 'rescue')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDogManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Dog Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search dogs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Dogs</option>
            <option value="rescue">Rescue</option>
            <option value="treatment">Treatment</option>
            <option value="adoption">Adoption Ready</option>
            <option value="adopted">Adopted</option>
          </select>
          <button className="admin-btn primary" onClick={() => setShowAddDogModal(true)}>
            <Plus size={16} />
            Register Dog
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Tag Color</th>
              <th>Health Status</th>
              <th>Status</th>
              <th>Vaccinations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dogs.map(dog => (
              <tr key={dog.id}>
                <td>{dog.uniqueCode}</td>
                <td>
                  <div className="admin-dog-photo">
                    {dog.photo ? (
                      <img src={`http://localhost:3000/uploads/dogs/${dog.photo}`} alt={dog.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ddd' }}>
                        <PawPrint size={20} color="#999" />
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-dog-info"><PawPrint size={16} /><span>{dog.name}</span></div>
                </td>
                <td>{dog.breed}</td>
                <td>{dog.age}</td>
                <td><span className={`admin-tag-badge ${dog.tagColor}`}>{dog.tagColor}</span></td>
                <td><span className={`admin-health-badge ${dog.healthStatus}`}>{dog.healthStatus}</span></td>
                <td><span className={`admin-status-badge ${dog.status}`}>{dog.status}</span></td>
                <td>
                  <div className="admin-vaccinations">
                    {dog.vaccinations.length > 0 ? (
                      dog.vaccinations.map((vax, index) => (
                        <span key={index} className="admin-vax-badge">{vax}</span>
                      ))
                    ) : (
                      <span className="admin-no-vax">None</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-actions">
                    {/* Action buttons for each user 
                    <button className="admin-icon-btn" onClick={() => handleEdit(dog.id, 'dog')}><Edit size={16} /></button>*/}
                    <button className="admin-icon-btn"><Eye size={16} /></button>
                    {dog.status === 'treatment' && (
                      <button className="admin-icon-btn success" onClick={() => handleMarkAdoptionReady(dog.id)}><Shield size={16} /></button>
                    )}
                    {dog.status === 'adopted' && (
                      <span className="admin-adopted-label" style={{color: '#10b981', fontSize: '12px', fontWeight: 'bold'}}>✓ Adopted</span>
                    )}
                    <button className="admin-icon-btn" onClick={() => handleDelete(dog.id, 'dog')}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdoptionManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Adoption Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search adoption requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Dog</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adoptionRequests.map(request => (
              <tr key={request.id}>
                <td>#{request.id}</td>
                <td>
                  <div className="admin-dog-info"><PawPrint size={16} /><span>{request.dogName}</span></div>
                </td>
                <td>{request.userName}</td>
                <td>{request.date}</td>
                <td><span className={`admin-status-badge ${request.status}`}>{request.status}</span></td>
                <td>
                  <div className="admin-actions">
                    {request.status === 'pending' && (
                      <>
                        <button className="admin-icon-btn success" onClick={() => handleApprove(request.id, 'adoption')}><CheckCircle size={16} /></button>
                        <button className="admin-icon-btn danger" onClick={() => handleReject(request.id, 'adoption')}><XCircle size={16} /></button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button className="admin-icon-btn primary" onClick={() => handleGenerateCertificate(request.id)}><FileCheck size={16} /></button>
                    )}
                    <button className="admin-icon-btn"><Eye size={16} /></button>
                    <button className="admin-icon-btn danger" onClick={() => handleDelete(request.id, 'adoption')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVolunteerManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Volunteer Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Volunteers</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Tasks Assigned</th>
              <th>Tasks Completed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map(volunteer => (
              <tr key={volunteer.id}>
                <td>
                  <div className="admin-user-info">
                    <div className="admin-user-avatar">
                      {volunteer.name.charAt(0)}
                    </div>
                    <span>{volunteer.name}</span>
                  </div>
                </td>
                <td>{volunteer.email}</td>
                <td>{volunteer.tasks}</td>
                <td>{volunteer.completed}</td>
                <td>
                  <span className={`admin-status-badge ${volunteer.status}`}>
                    {volunteer.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {volunteer.status === 'pending' && (
                      <button className="admin-icon-btn success" onClick={() => handleApprove(volunteer.id, 'volunteer')}>
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {/* Action buttons for each user 
                    <button className="admin-icon-btn" onClick={() => handleEdit(volunteer.id, 'volunteer')}>
                      <Edit size={16} />
                    </button>*/}
                    <button className="admin-icon-btn">
                      <Eye size={16} />
                    </button>
                    <button className="admin-icon-btn danger" onClick={() => handleDelete(volunteer.id, 'volunteer')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "emergency":
        return renderEmergencyManagement();
      case "dogs":
        return renderDogManagement();
      case "adoptions":
        return renderAdoptionManagement();
      case "volunteers":
        return renderVolunteerManagement();
      case "users":
        return renderUsers();
      case "events":
        return renderEvents();
      default:
        return renderOverview();
    }

  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">
            <PawPrint size={28} />
            <h1>Street Dog Shelter Admin</h1>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="admin-notifications">
            <Bell size={20} />
            <span className="admin-notification-badge">3</span>
          </div>
          <div className="admin-user">
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin User</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="admin-dashboard-content">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-sidebar-nav">
            <button 
              className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 size={20} />
              <span>Overview</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "emergency" ? "active" : ""}`}
              onClick={() => setActiveTab("emergency")}
            >
              <AlertTriangle size={20} />
              <span>Emergency Mgmt</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "dogs" ? "active" : ""}`}
              onClick={() => setActiveTab("dogs")}
            >
              <PawPrint size={20} />
              <span>Dog Management</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "adoptions" ? "active" : ""}`}
              onClick={() => setActiveTab("adoptions")}
            >
              <Heart size={20} />
              <span>Adoptions</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "volunteers" ? "active" : ""}`}
              onClick={() => setActiveTab("volunteers")}
            >
              <Users size={20} />
              <span>Volunteers</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <UserPlus size={20} />
              <span>Users</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              <Calendar size={20} />
              <span>Events</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <FileText size={20} />
              <span>Reports</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main-content">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && renderAddUserModal()}
      {showAddEventModal && renderAddEventModal()}
      {showAddRescueModal && renderAddRescueModal()}
      {showAddDogModal && renderAddDogModal()}
      {showEmergencyMap && renderEmergencyMap()}
    </div>
  );
};


export default AdminDashboard;