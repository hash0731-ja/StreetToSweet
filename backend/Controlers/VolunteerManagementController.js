const Volunteer = require("../Model/VolunteerModel");
const VolunteerTask = require("../Model/VolunteerTaskModel");
const Dog = require("../Model/DogModel");
const User = require("../Model/Register");

// Get assigned dogs for logged-in volunteer
const getAssignedDogs = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    // Find volunteer by user ID
    const volunteer = await Volunteer.findOne({ userId: volunteerId })
      .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
      .populate('assignedTasks.taskId');

    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer profile not found'
      });
    }

    // Transform the data for frontend
    const assignedDogs = volunteer.assignedDogs.map(assignment => ({
      assignmentId: assignment._id,
      dogId: assignment.dogId,
      assignedDate: assignment.assignedDate,
      assignmentStatus: assignment.assignmentStatus
    }));

    res.json({
      status: 'success',
      data: assignedDogs
    });
  } catch (error) {
    console.error('Get assigned dogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get assigned dogs',
      error: error.message
    });
  }
};

// Get tasks for logged-in volunteer
const getVolunteerTasks = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    // Find volunteer by user ID first
    const volunteer = await Volunteer.findOne({ userId: volunteerId });
    
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer profile not found'
      });
    }

    // Get tasks using volunteer ID (from Volunteer collection)
    const tasks = await VolunteerTask.find({ volunteerId: volunteer._id })
      .populate('dogId', 'name breed photo healthStatus status')
      .sort({ scheduledTime: 1 });

    res.json({
      status: 'success',
      data: tasks
    });
  } catch (error) {
    console.error('Get volunteer tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get volunteer tasks',
      error: error.message
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const volunteerId = req.user._id;

    // Find volunteer first
    const volunteer = await Volunteer.findOne({ userId: volunteerId });
    
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer profile not found'
      });
    }

    // Update task status
    const task = await VolunteerTask.findOneAndUpdate(
      { 
        _id: taskId, 
        volunteerId: volunteer._id 
      },
      { 
        status: status,
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true }
    ).populate('dogId', 'name breed photo');

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found or access denied'
      });
    }

    // Update volunteer's completed tasks count if task is completed
    if (status === 'completed') {
      await Volunteer.findByIdAndUpdate(
        volunteer._id,
        { $inc: { completedTasks: 1 } }
      );
    }

    res.json({
      status: 'success',
      message: `Task status updated to ${status}`,
      data: { task }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

module.exports = {
  getAssignedDogs,
  getVolunteerTasks,
  updateTaskStatus
};