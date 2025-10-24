import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobDetails,
  applyForJob,
} from '../controllers/jobController.js';
import { authenticateToken, requireAdmin, requireApplicant, requireUser } from '../middlewares/auth.js';
import { validateJobCreation } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/admin/job', requireAdmin, validateJobCreation, createJob);

router.get('/admin/job/:job_id', requireAdmin, getJobDetails);

router.get('/', requireUser, getAllJobs);

router.get('/apply', requireApplicant, applyForJob);

export default router;
