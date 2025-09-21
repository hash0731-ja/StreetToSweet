const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    getAdminDashboard, 
    getAllUsers, 
    updateUserStatus, 
    deleteUser, 
    promoteUser,
    createUser,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getAvailableDrivers
} = require('../Controlers/AdminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer for event image uploads
const eventImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/events');
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            // ignore if already exists
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadEventImage = multer({
    storage: eventImageStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Only image files are allowed for events'));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin dashboard routes
router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.get('/drivers', getAvailableDrivers);
router.post('/users', createUser);
router.put('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/promote', promoteUser);

// Event management
router.get('/events', getAllEvents);
// Accept optional image upload with field name 'photo'
router.post('/events', uploadEventImage.single('photo'), createEvent);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);

module.exports = router;
