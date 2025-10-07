import React, { useEffect, useState, Link } from "react";
import "./Home.css";
import Footer from "../Footer/Footer";
import axios from "axios";
import DogCard from "../DogCard/DogCard";  
import { useNavigate } from "react-router-dom";
import {
  Ambulance,
  Activity,
  Dog,
  HeartHandshake,
  HeartPulse,
  Smartphone,
  Stethoscope,
  House,
  Search,
  DogIcon,
  Calendar,
  HeartPlus,
} from "lucide-react";

import walkImg from "../../assets/walk.jpg";
import feedImg from "../../assets/feed.jpg";
import cleanImg from "../../assets/clean.jpg";
import rescueImg from "../../assets/rescue.jpg";

import qr from "../../assets/qr.jpg";


import bg1 from "../../assets/bg1.jpg";
import bg2 from "../../assets/bg2.jpg";
import bg3 from "../../assets/bg3.png";
import bg4 from "../../assets/bg4.jpg";
import { FaArrowRight } from "react-icons/fa";

import lostdog from "../../assets/lostdog.jpg";

const Home = () => {
  const navigate = useNavigate();
 const [spotlightDogs, setSpotlightDogs] = useState([]);
  // --- Hero images ---
  const images = [bg1, bg2, bg3, bg4];
  const [bgIndex, setBgIndex] = useState(0);
  const [typedText, setTypedText] = useState("");


  // --- Typing animation for hero title ---
  useEffect(() => {
    const text = "StreetToSweet 🐾";
    let i = 0;
    let deleting = false;

    const typingInterval = setInterval(() => {
      if (!deleting) {
        setTypedText(text.slice(0, i + 1));
        i++;
        if (i === text.length) {
          setTimeout(() => {
            deleting = true;
          }, 1000); // pause before deleting
        }
      } else {
        setTypedText(text.slice(0, i - 1));
        i--;
        if (i === 0) {
          deleting = false;
        }
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  // --- Auto-scroll hero images ---
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [images.length]);

  useEffect(() => {
  fetch("http://localhost:3000/dogs")
    .then(res => res.json())
    .then(data => {
      const updated = data.map(d => ({
        ...d,
        photo: d.photo ? `http://localhost:3000/uploads/dogs/${d.photo}` : "/placeholder.jpg"
      }));
      const adoptionDogs = updated.filter(d => d.status === "adoption");
      setSpotlightDogs(adoptionDogs.slice(0, 4)); // ✅ only first 6
    })
    .catch(console.error);
}, []);


  // Chatbox toggle
  const [openChat, setOpenChat] = useState(false);

  const cards = [
    {
      icon: <Ambulance size={36} />,
      title: "Rescue",
      desc: "24/7 emergency response to save stray dogs in need.",
      color: "#FF6B6B",
    },
    {
      icon: <Activity size={36} />,
      title: "Care",
      desc: "Providing medical treatment, food, and safe shelter.",
      color: "#4ECDC4",
    },
    {
      icon: <Dog size={36} />,
      title: "Adopt",
      desc: "Helping families connect with their future furry friends.",
      color: "#556270",
    },
    {
      icon: <HeartHandshake size={36} />,
      title: "Love",
      desc: "Every adoption leads to a lifelong bond of love.",
      color: "#FFB347",
    },
  ];

  const roles = [
    {
      img: feedImg,
      title: "Feeding",
      desc: "Help provide meals and hydration to rescued dogs daily.",
    },
    {
      img: walkImg,
      title: "Walking",
      desc: "Take dogs for walks to keep them active, happy, and healthy.",
    },
    {
      img: cleanImg,
      title: "Cleaning",
      desc: "Assist with keeping kennels and play areas neat and hygienic.",
    },
    {
      img: rescueImg,
      title: "Rescue",
      desc: "Join our emergency response team to save injured street dogs.",
    },
  ];

  const [messages, setMessages] = useState([
    { text: "Hello! How can we help you? 🐾", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;

    // Add user message
    setMessages([...messages, { text: input, sender: "user" }]);
    setInput(""); // clear input
  };

  return (
    <div className="home">
     

      {/* 1️⃣ Hero / Carousel */}
      <section id="carousel-container">
        <div
          id="carousel"
          style={{ transform: `translateX(-${bgIndex * 100}vw)` }}
        >
          {images.map((img, idx) => (
            <div className="carousel-item" key={idx}>
              <img src={img} alt={`Rescued Dog ${idx + 1}`} />
            </div>
          ))}
        </div>

        <div id="carousel-overlay-center">
          <h1 className="typing-text">{typedText}</h1>
          <h3> One Platform, One Mission: Safe Homes for Every Street Dog</h3>
          <div className="carousel-buttons">
            <button
              className="btn-modern-btn"
              onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            >
              Get Started 🢃
            </button>
            <button
              className="btn-modern-btn"
              onClick={() => navigate("/adoption")}
            >
              Adopt a Dog 🢂
            </button>
          </div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section className="about">
        <div className="about-header">
          <h2>
            About <span>StreetToSweet</span>
          </h2>
          <p>
            StreetToSweet is a{" "}
            <strong>community-driven shelter management system</strong> built to
            transform the lives of stray dogs. From rescue to adoption, our
            platform ensures proper care, shelter, and community awareness.
          </p>
          <p>
            Our system provides real-time stray reporting, adoption listings,
            donation management, and volunteer coordination - making rescue and
            rehoming easier and impactful.
          </p>
        </div>

        <div className="ab-timeline-cards">
          {cards.map((card, index) => (
            <div className="ab-timeline-card" key={index}>
              <div className="ab-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Rescue / Emergency Section --- */}
      <section className="rescue-section">
        <h2 className="rescue-header">Report a Stray Dog 🚨</h2>

        <div className="rescue-content">
          <HeartPulse className="heart-pulse" size={150} />

          <p className="rescue-description">
            Found an injured or abandoned dog? Help us save lives immediately by
            reporting. Our rescue team responds 24/7 to ensure every stray dog
            gets the care it deserves.
          </p>

          {/* How it works infographic */}
          <div className="rescue-infographic">
            <div className="step">
              {" "}
              <Smartphone size={100} /> <br />
              Report
            </div>
            <div className="arrow">
              <FaArrowRight size={50} />
            </div>
            <div className="step">
              <Ambulance size={100} /> <br />
              Rescue
            </div>
            <div className="arrow">
              <FaArrowRight size={50} />
            </div>
            <div className="step">
              <Stethoscope size={100} /> <br />
              Medical Care
            </div>
            <div className="arrow">
              <FaArrowRight size={50} />
            </div>
            <div className="step">
              <House size={100} /> <br />
              Adoption
            </div>
          </div>
          <button
            className="btn emergency-btn"
            onClick={() => {
              window.scrollTo({ top: 100, behavior: "smooth" });
              navigate("/reportStray");
            }}
          >
            Report Now
          </button>
        </div>
      </section>

     {/* --- Adoption Spotlight --- */}
<section className="spotlight">
  <h2>Adoption Spotlight <Dog size={50} color="#6f2b83ff" /></h2>
  <p className="section-desc"> Give rescued dogs a loving home. Explore some of our adorable dogs below! </p>
  <h3>If you want to browse more dogs, click here.</h3> <button className="btn adopt" onClick={() => { window.scrollTo({ top: 100, behavior: "smooth" }); navigate("/adoptdogspage"); }} > See All Dogs </button> <br></br> <br></br> <br></br> <br></br> <br></br>
  <div className="dog-grid">
    {spotlightDogs.length > 0 ? (
      spotlightDogs.map(dog => (
        <DogCard
          key={dog._id}
          dog={dog}
          onSeeDetails={() => {}}
          onAdopt={() => {}}
        />
      ))
    ) : (
      <p>No adoption-ready dogs available right now.</p>
    )}
  </div>




<br></br>
        {/* --- Small Sub-section for Adoption Journey --- */}
        <div className="adoption-journey">
          <p>Already adopted a dog? Track your journey here!</p><br></br>
          <button
            className="btn dashboard"
            onClick={() => navigate("/adoptionDashboard")}
          >
            My Adoption Dashboard
          </button>
        </div>



      </section>

       <section className="lostfound-section">
  <h2>
    Lost or Found a Pet?  <Search size={40} color="#3e3e3eff"/>
  </h2>

  <div className="lostfound-row">
    {/* Left: Image */}
    <div className="lostfound-illustration">
      <img
  src={lostdog}
  alt="Lost Dog Illustration"
/>
    </div>

    {/* Right: Text + Button */}
    <div className="lostfound-content">
      <p>
        Every lost pet deserves a chance to be found. Use our Lost &amp;
        Found platform to report missing dogs, share information about
        pets you’ve rescued, or browse community posts.
      </p>
      <p>
        Together, we can help families reunite with their beloved companions.
      </p>
      <button
        className="btn view"
        onClick={() => {
          window.scrollTo({ top: 100, behavior: "smooth" });
          navigate("/lostfound");
        }}
      >
        Report/Found Dog <FaArrowRight size={15} />
      </button>
    </div>
  </div>
</section>

<br></br>
      <section className="home-volunteer-section">
        <h2>
          Not ready to adopt? <DogIcon size={40} color="#190958ff"/> <br />
          <span className="highlight">Be a hero, become a volunteer!</span>
        </h2>

        <div className="home-volunteer-cards">
          {roles.map((role, index) => (
            <div key={index} className="home-volunteer-card">
              <div className="img-box">
                <img src={role.img} alt={role.title} />
                <div className="overlay"></div>
              </div>
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
            </div>
          ))}
        </div>

        <button className="cta-btn"onClick={() => {
            window.scrollTo({ top: 40, behavior: "smooth" });
            navigate("/volunteerregister");
          }} >Register as Volunteer</button>
      </section>

      {/* --- Upcoming Events & Awareness --- */}
      <section className="events-section">
        <div className="events-header">
          <h2 className="events-title">
            <br></br>
            <span className="highlight">Upcoming Events</span> & Awareness{" "}
            <Calendar size={40} />
          </h2>
          <p>Be part of our mission — together we make tails wag! 🐾</p>
        </div>

        <div className="events-cards">
          {/* Example Event Card */}
          <div className="event-card">
            <div className="badge">Adoption</div>
            <img
              src="https://placedog.net/400/250?id=50"
              alt="Adoption Drive Ella"
              className="event-img"
            />
            <div className="event-info">
              <h3>Adoption Drive – Ella </h3>
              <p className="event-meta">📅 Sep 15th | 📍 Ella, Sri Lanka</p>
              <p>
                Meet adorable rescued dogs and give them a loving home. Join our
                awareness campaign for a better future!
              </p>
              
            </div>
          </div>

          <div className="event-card">
            <div className="badge fundraiser">Fundraiser</div>
            <img
              src="https://placedog.net/400/250?id=51"
              alt="Fundraiser Colombo"
              className="event-img"
            />
            <div className="event-info">
              <h3>Fundraiser – Colombo </h3>
              <p className="event-meta">📅 Oct 3rd | 📍 Colombo, Sri Lanka</p>
              <p>
                Support our rescue efforts and join our fun-filled community
                fundraising event.
              </p>
              
            </div>
          </div>

          <div className="event-card">
            <div className="badge awareness">Awareness</div>
            <img
              src="https://placedog.net/400/250?id=52"
              alt="Awareness Workshop Kandy"
              className="event-img"
            />
            <div className="event-info">
              <h3>Awareness Workshop – Kandy </h3>
              <p className="event-meta">📅 Nov 10th | 📍 Kandy, Sri Lanka</p>
              <p>
                Learn how to care for stray dogs, rescue techniques, and how to
                volunteer effectively.
              </p>
              
            </div>
          </div>
        </div>

        <div className="events-footer">
          <button
            className="btn all-events"
            onClick={() => {
            window.scrollTo({ top: 100, behavior: "smooth" });
            navigate("/eventlisting");
          }}
          >
            View All Events 🢂
          </button>
        </div>
        <br></br>
      </section>

     <section className="donation-section">
  {/* Floating paw background */}
  <div className="paw-bg">
    <span>🐾</span>
    <span>🐾</span>
    <span>🐾</span>
    <span>🐾</span>
    <span>🐾</span>
  </div>

  {/* Header centered at top */}
  <h2 className="donation-title">
    Every Paw Needs Your Support <HeartPlus size={40} color="#0d3c23ff"/>
  </h2>

  {/* Row: Left Image, Right Content */}
  <div className="donation-container">
    {/* Left Image */}
    <div className="donation-image">
      <img
        src="https://thumbs.dreamstime.com/b/donation-dog-chihuahua-can-collecting-money-charity-isolated-white-background-46887219.jpg"
        alt="Cute Dog"
      />
    </div>

    {/* Right Content */}
    <div className="donation-content">
      <p className="donation-desc">
        Your donations fund rescues, food, medicine, and shelter for
        street dogs. Every contribution saves lives! Let's make tails wag together.
      </p>

      {/* Predefined Amounts */}
      <div className="donation-amounts">
        <button className="amount-btn">Rs. 500</button>
        <button className="amount-btn">Rs. 1000</button>
        <button className="amount-btn">Rs. 2500</button>
        <button className="amount-btn custom">Custom</button>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <p>This month’s goal: <strong>75% reached!</strong></p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "75%" }}></div>
        </div>
      </div>

      {/* Donate Button */}
      <button
        className="btn donate"
        onClick={() => {
          window.scrollTo({ top: 1100, behavior: "smooth" });
          navigate("/donate");
        }}
      >
        💳 Donate Now
      </button>

      {/* QR Code → navigate to DonationPay.js */}
      <div className="qr-container-i">
        <p>Scan to Donate ❤</p>
        <img
          src={qr}
          alt="QR Code"
          style={{ cursor: "pointer" }}
           onClick={() => {
              window.scrollTo({ top: 1000, behavior: "smooth" });
              navigate("/donate");
            }}
        />
      </div>

      {/* Note */}
      <p className="note">
        💡Your Donations go towards food, shelter, and medical care for rescued dogs.
      </p>
    </div>
  </div>

</section>


      <Footer />

      <div className={`chatbox ${openChat ? "open" : ""}`}>
        {openChat ? (
          <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
              <span>💬 Chat with us</span>
              <button className="close-btn" onClick={() => setOpenChat(false)}>
                ✖
              </button>
            </div>

            {/* Body */}
            <div className="chat-body">
              {messages.map((msg, index) => (
                <p
                  key={index}
                  className={
                    msg.sender === "user" ? "chat-msg user" : "chat-msg bot"
                  }
                >
                  {msg.text}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div className="chat-footer">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="send-btn" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        ) : (
          <button className="chat-toggle" onClick={() => setOpenChat(true)}>
            💬
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
