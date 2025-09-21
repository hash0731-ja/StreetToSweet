// AdoptionRequestRoutes.js
const express = require('express');
const router = express.Router();

// Import controller functions
const AdoptionRequestController = require('../Controlers/AdoptionRequestControllers');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');

// Create new adoption request (authenticated users)
router.post("/", authenticateToken, requireUser, AdoptionRequestController.createAdoptionRequest);

// Admin: Get all adoption requests
router.get("/", authenticateToken, requireAdmin, AdoptionRequestController.getAdoptionRequests);

// User: Get my adoption requests
router.get("/mine", authenticateToken, requireUser, AdoptionRequestController.getMyAdoptionRequests);

// Admin or User: Get adoption requests for a specific dog (could be used by admin)
router.get("/dog/:dogId", authenticateToken, requireAdmin, AdoptionRequestController.getRequestsByDog);

// Get by ID (admin only for now)
router.get("/:id", authenticateToken, requireAdmin, AdoptionRequestController.getAdoptionRequestById);

// Get certificate data with enhanced information (admin or user who made the request)
router.get("/:id/certificate", authenticateToken, requireUser, AdoptionRequestController.getAdoptionCertificateData);

// Update adoption request (owner limited fields or admin)
router.put("/:id", authenticateToken, AdoptionRequestController.updateAdoptionRequest);

// Approve/Reject (admin)
router.post("/:id/approve", authenticateToken, requireAdmin, AdoptionRequestController.approveAdoptionRequest);
router.post("/:id/reject", authenticateToken, requireAdmin, AdoptionRequestController.rejectAdoptionRequest);

// Delete adoption request (owner or admin)
router.delete("/:id", authenticateToken, AdoptionRequestController.deleteAdoptionRequest);
// Get pending requests (vet/admin)
router.get("/pending", authenticateToken, requireAdmin, AdoptionRequestController.getPendingAdoptionRequests);

router.post("/:id/vet-review", authenticateToken, requireAdmin, AdoptionRequestController.sendToVetReview);


module.exports = router;
