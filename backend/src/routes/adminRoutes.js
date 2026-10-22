import express from 'express';
import {
  getFacultyList,
  getUserDetailsForAdmin,
  toggleEditPermission,
  updateUserRole,
  downloadFacultyResume,
} from '../controllers/adminController.js';
import { protect, isQEC, isAuditor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Directory listing (Chairman / OEC / QEC)
router.get('/faculty-list', protect, isAuditor, getFacultyList);

// Single faculty record + academic form (Chairman / OEC / QEC)
router.get('/users/:userId', protect, isAuditor, getUserDetailsForAdmin);

// Download a faculty CV (Chairman / OEC / QEC)
router.get('/download-cv/:userId', protect, isAuditor, downloadFacultyResume);

// Lock / unlock a faculty record (QEC only)
router.put('/toggle-edit', protect, isQEC, toggleEditPermission);

// Change a portal role (QEC only)
router.put('/change-role', protect, isQEC, updateUserRole);

export default router;
