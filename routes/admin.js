import express from 'express';
import {
  getAllApplicants,
  getApplicantDetails,
  getAdminJobs,
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/admin/applicants', getAllApplicants);

router.get('/admin/applicant/:applicant_id', getApplicantDetails);

router.get('/jobs', getAdminJobs);

export default router;
