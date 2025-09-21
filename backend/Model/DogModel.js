const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: String,
  breed: String,
  status: { type: String, default: "adoption", enum: ["adoption", "treatment", "adopted"] }, // "adoption", "treatment", or "adopted"
  description: String, // rescue story
  vaccinated: Boolean,
  health: String,
  arrival: Date,
  notes: String,
  badges: [String],
  photo: String, // store filename to serve via /file/:filename
  // Extended health fields used by vet workflows
  healthStatus: { type: String, enum: ['poor', 'fair', 'good', 'excellent', 'healthy', 'monitoring', 'needs_care', 'critical'], default: 'good' },
  medicalNotes: { type: String, default: '' },
  treatment: { type: String, default: '' },
  nextCheckup: { type: Date, default: null }
}, { timestamps: true });

// Avoid OverwriteModelError
module.exports = mongoose.models.DogModel || mongoose.model("DogModel", dogSchema);
