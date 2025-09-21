const mongoose = require("mongoose");

const volunteerTaskSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true
    },
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DogModel",
      required: true
    },
    taskType: {
      type: String,
      enum: ["feeding", "walking", "grooming", "medication", "training", "cleaning", "socialization"],
      required: true
    },
    taskDescription: {
      type: String,
      required: true
    },
    scheduledTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 30
    },
    actualDuration: {
      type: Number // in minutes
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VolunteerTask", volunteerTaskSchema);
