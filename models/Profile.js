import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeFileAddress: {
    type: String,
    trim: true
  },
  skills: {
    type: String,
    trim: true
  },
  education: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },

  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

profileSchema.index({ applicant: 1 });

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
