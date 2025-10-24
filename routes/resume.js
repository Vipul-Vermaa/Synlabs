import express from 'express';
import { uploadResume } from '../controllers/resumeController.js';
import { authenticateToken, requireApplicant } from '../middlewares/auth.js';
import { uploadResume as uploadMiddleware, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/uploadResume', requireApplicant, uploadMiddleware, handleUploadError, uploadResume);


export default router;
