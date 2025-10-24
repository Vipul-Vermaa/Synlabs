import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const getAllApplicants = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, userType } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { profileHeadline: { $regex: search, $options: 'i' } }
      ];
    }
    if (userType) {
      filter.userType = userType;
    }
    const users = await User.find(filter)
      .populate('profile')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profileHeadline: user.profileHeadline,
          address: user.address,
          profile: user.profile,
          createdAt: user.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all applicants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const getApplicantDetails = async (req, res) => {
  try {
    const { applicant_id } = req.params;

    const user = await User.findById(applicant_id)
      .populate('profile')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    // Get user's applications
    const applications = await Application.find({ applicant: applicant_id })
      .populate('job', 'title companyName location jobType')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profileHeadline: user.profileHeadline,
          address: user.address,
          profile: user.profile,
          createdAt: user.createdAt
        },
        applications: applications.map(app => ({
          id: app._id,
          job: app.job,
          status: app.status,
          appliedAt: app.appliedAt,
          notes: app.notes
        }))
      }
    });
  } catch (error) {
    console.error('Get applicant details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const getAdminJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = { postedBy: req.user._id };

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const jobs = await Job.find(filter)
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
          isActive: job.isActive,
          createdAt: job.createdAt
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
    console.error('Get admin jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


