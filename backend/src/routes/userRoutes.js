import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multer.js';
import {
  updateUserProfile,
  saveOrUpdateAcademic,
  getMyAcademicData,
  downloadAcademicResume,
} from '../controllers/userController.js';

const router = express.Router();

// Apply Auth Protection on all user routes
router.use(protect);

// Personal Profile Update (with optional image)
router.put('/profile', upload.single('image'), updateUserProfile);

// Google Academic Form CRUD
router.route('/academic')
  .post(saveOrUpdateAcademic)
  .put(saveOrUpdateAcademic)
  .get(getMyAcademicData);

// Dynamic PDF CV Download
router.get('/download-cv', downloadAcademicResume);

export default router;