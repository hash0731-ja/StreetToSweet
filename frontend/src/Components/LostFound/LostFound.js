import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import { AlertCircle, CheckCircle, FileText, MapPin, PawPrint, Search, SearchCheck } from "lucide-react";
import "./LostFound.css";
import lostfound from "../../assets/lostfound.jpg";

const LostFound = () => {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:3000";

  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState("Lost");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("Lost");
  const [selectedOwner, setSelectedOwner] = useState(null);

  const placeholderImg =
    "https://images.unsplash.com/photo-1601758123927-00b437a98b36?auto=format&fit=crop&w=600&q=80";

  // Fetch posts from backend
  useEffect(() => {
    axios
      .get(`${backendUrl}/lostfound`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  // File preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
    else setPreview(null);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !details || !userName || !userEmail || !userPhone || !location) {
      return alert("Please fill all fields");
    }

    try {
      const formData = new FormData();
      formData.append("name", title);
      formData.append("details", details);
      formData.append("type", type);
      formData.append("owner", userName);
      formData.append("ownerEmail", userEmail);
      formData.append("ownerPhone", userPhone);
      formData.append("location", location);
      if (file) formData.append("image", file);

      const res = await axios.post(`${backendUrl}/lostfound`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add new post to state
      setPosts([res.data, ...posts]);

      // Reset form
      setTitle("");
      setDetails("");
      setUserName("");
      setUserEmail("");
      setUserPhone("");
      setLocation("");
      setType("Lost");
      setFile(null);
      setPreview(null);

      navigate("/userprofile");
    } catch (err) {
      console.error("Error submitting post:", err);
      alert("Error submitting report");
    }
  };

  const filteredPosts = posts.filter((post) => post.type === activeTab);

  return (
    <>
      

      {/* Hero Section */}
      <div className="lf-hero">
        <div className="lf-hero-content">
          <h1 className="lf-hero-title">Help Reunite Lost & Found Dogs</h1>
          <p className="lf-hero-subtext">
            Report or search for street dogs to bring them back home safely.
          </p>
          <div className="lf-hero-buttons">
            <button className="lf-btn-primary" onClick={() => setType("Lost")}>
              Report Lost Dog
            </button>
            <button className="lf-btn-secondary" onClick={() => setType("Found")}>
              Report Found Dog
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <section className="lf-form-section">
        <div className="lf-form-container">
          <div className="lf-form-image">
            <img src={lostfound} alt="Dog" />
          </div>

          <div className="lf-form">
            <h3>
              Report {type} Dog <PawPrint size={32} />
            </h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input
                type="text"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                required
              />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
              <input
                type="text"
                placeholder="Dog Name / Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <textarea
                placeholder="Details (breed, color, marks, behavior)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
              <input type="file" onChange={handleFileChange} />
              {preview && <img src={preview} alt="preview" className="lf-preview" />}
              <button type="submit" className="lf-submit">
                Submit Report
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="lf-tabs">
        <button
          className={`lf-tab-button ${activeTab === "Lost" ? "active-tab-a" : ""}`}
          onClick={() => setActiveTab("Lost")}
        >
          <Search size={32} /> Lost Dogs
        </button>
        <button
          className={`lf-tab-button ${activeTab === "Found" ? "active-tab-b" : ""}`}
          onClick={() => setActiveTab("Found")}
        >
          <SearchCheck size={32} /> Found Dogs
        </button>
      </section>

      {/* Posts Section */}
      <section className="lf-posts-section">
        <div className="lf-posts">
          <h3>{activeTab} Dogs</h3>
          {filteredPosts.length === 0 && <p>No {activeTab.toLowerCase()} dogs reported.</p>}
          <div className="lf-post-grid">
            {filteredPosts.map((post) => (
              <div key={post._id} className={`lf-card ${post.type === "Lost" ? "dog-lost-card" : "dog-found-card"}`}>
                <div className="lf-card-header">
                  {post.type === "Lost" ? (
                    <AlertCircle className="icon lost-icon" />
                  ) : (
                    <CheckCircle className="icon found-icon" />
                  )}
                  <span>{post.name}</span>
                </div>
                <img
                  src={post.image ? `${backendUrl}/uploads/${post.image}` : placeholderImg}
                  alt={post.name}
                  className="lf-image"
                />
                <p className="lf-location">
                  <MapPin  color="#239ce1ff"/> <span>Location: </span>{post.location || "Unknown"}  -  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="lf-details">
                  
                 <FileText size={35} color="#239ce1ff"/>
<span> Details: </span>{post.details}
                </p>

                {selectedOwner?._id === post._id && (
                  <div className="lf-owner-details-inline">
                    <h4>Contact Details</h4>
                    <p>
                      <strong>Name:</strong> {post.owner}
                    </p>
                    <p>
                      <strong>Email:</strong> {post.ownerEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong> {post.ownerPhone}
                    </p>
                    <button className="lf-close-owner" onClick={() => setSelectedOwner(null)}>
                      Close
                    </button>
                  </div>
                )}

                <div className="lf-card-buttons">
                  <button onClick={() => setSelectedOwner(post)}>Contact Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LostFound;
