const Volunteer = require("../Model/VolunteerModel");

// 1. Get all volunteers
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    if (!volunteers || volunteers.length === 0) {
      return res.status(404).json({ message: "No volunteers found" });
    }
    return res.status(200).json({ volunteers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2. Add new volunteer
const addVolunteer = async (req, res) => {
  const { name, email, phone, availability, task, motivation } = req.body;
  
  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({ 
      message: "Missing required fields", 
      error: "Name, email, and phone are required" 
    });
  }

  try {
    // Check if volunteer with this email already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(409).json({ 
        message: "Volunteer already exists", 
        error: "A volunteer with this email is already registered" 
      });
    }

    const volunteer = await Volunteer.create({ 
      name, 
      email, 
      phone, 
      availability, 
      task, 
      motivation 
    });
    
    return res.status(201).json({ 
      message: "Volunteer registered successfully",
      volunteer 
    });
  } catch (err) {
    console.error("Error creating volunteer:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        error: validationErrors.join(', ')
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: "Duplicate entry", 
        error: "A volunteer with this information already exists" 
      });
    }
    
    return res.status(500).json({ 
      message: "Server error", 
      error: "Unable to register volunteer. Please try again later." 
    });
  }
};

// 3. Get volunteer by ID
const getVolunteerById = async (req, res) => {
  const id = req.params.id;
  try {
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    return res.status(200).json({ volunteer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 4. Update volunteer
const updateVolunteer = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, availability, task, motivation } = req.body;
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { name, email, phone, availability, task, motivation },
      { new: true, runValidators: true }
    );
    if (!volunteer) {
      return res.status(404).json({ message: "Unable to update volunteer details" });
    }
    return res.status(200).json({ volunteer });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// 5. Delete volunteer
const deleteVolunteer = async (req, res) => {
  const id = req.params.id;
  try {
    const volunteer = await Volunteer.findByIdAndDelete(id);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    return res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllVolunteers,
  addVolunteer,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
};
