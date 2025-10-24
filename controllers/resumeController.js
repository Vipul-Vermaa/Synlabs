import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

// Upload and process resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user._id;
    const filePath = req.file.path;

    let profile = await Profile.findOne({ applicant: userId });

    if (!profile) {
      profile = new Profile({
        applicant: userId,
        name: req.user.name,
        email: req.user.email
      });
    }
    profile.resumeFileAddress = filePath;

    // Process resume with third-party API
    try {
      const resumeData = await processResumeWithAPI(filePath);

      if (resumeData) {
        profile.name = resumeData.name || profile.name;
        profile.email = resumeData.email || profile.email;
        profile.phone = resumeData.phone || profile.phone;

        profile.skills = resumeData.skills ? resumeData.skills.join(', ') : '';
        profile.education = resumeData.education ?
          resumeData.education.map(edu => edu.name).join(', ') : '';
        profile.experience = resumeData.experience ?
          resumeData.experience.map(exp => `${exp.name} (${exp.dates ? exp.dates.join(' - ') : 'N/A'})`).join(', ') : '';

        profile.extractedData = resumeData;
      }
    } catch (apiError) {
      console.error('Resume processing API error:', apiError);

    }

    await profile.save();

    if (!req.user.profile) {
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      data: {
        profile: {
          id: profile._id,
          resumeFileAddress: profile.resumeFileAddress,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience
        }
      }
    });

  } catch (error) {
    console.error('Upload resume error:', error);

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Process resume with third-party API
const processResumeWithAPI = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const response = await axios.post(
      'https://api.apilayer.com/resume_parser/upload',
      fileBuffer,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'apikey': '0bWeisRWoLj3UdXt3MXMSMWptYFIpQfS'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (response.data) {
      console.log('Resume processed successfully:', response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Resume processing API error:', error.response?.data || error.message);
    throw error;
  }
};

