import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

// Create a new job (Admin only)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      companyName,
      requirements,
      location,
      jobType,
      salaryRange
    } = req.body;

    const job = new Job({
      title,
      description,
      companyName,
      postedBy: req.user._id,
      requirements,
      location,
      jobType,
      salaryRange
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job: {
          id: job._id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          requirements: job.requirements,
          location: job.location,
          jobType: job.jobType,
          salaryRange: job.salaryRange,
          postedOn: job.postedOn,
          totalApplications: job.totalApplications,
          isActive: job.isActive
        }
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all jobs (for applicants and admins)
export const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location, jobType } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        jobs: jobs.map(job => ({
          id: job._id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          requirements: job.requirements,
          location: job.location,
          jobType: job.jobType,
          salaryRange: job.salaryRange,
          postedOn: job.postedOn,
          totalApplications: job.totalApplications,
          postedBy: job.postedBy
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
          hasNext: page * limit < totalJobs,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getJobDetails = async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await Job.findById(job_id)
      .populate('postedBy', 'name email')
      .populate('applicants', 'name email userType');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applications = await Application.find({ job: job_id })
      .populate('applicant', 'name email userType')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          requirements: job.requirements,
          location: job.location,
          jobType: job.jobType,
          salaryRange: job.salaryRange,
          postedOn: job.postedOn,
          totalApplications: job.totalApplications,
          postedBy: job.postedBy,
          isActive: job.isActive
        },
        applications: applications.map(app => ({
          id: app._id,
          applicant: app.applicant,
          status: app.status,
          appliedAt: app.appliedAt,
          notes: app.notes
        }))
      }
    });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Apply for a job (Applicant only)
export const applyForJob = async (req, res) => {
  try {
    const { job_id } = req.query;
    const applicantId = req.user._id;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer active'
      });
    }

    const existingApplication = await Application.findOne({
      job: job_id,
      applicant: applicantId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    const application = new Application({
      job: job_id,
      applicant: applicantId
    });

    await application.save();
    await Job.findByIdAndUpdate(job_id, {
      $addToSet: { applicants: applicantId },
      $inc: { totalApplications: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          id: application._id,
          job: job_id,
          applicant: applicantId,
          status: application.status,
          appliedAt: application.appliedAt
        }
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


