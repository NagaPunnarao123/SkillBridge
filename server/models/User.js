const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'student', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [{ type: String }],
  github: { type: String },
  linkedin: { type: String },
  portfolio: { type: String },
  college: { type: String },
  graduationYear: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
