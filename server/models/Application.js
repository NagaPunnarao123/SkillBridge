const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposal: { type: String, required: true },
  bidAmount: { type: Number },
  estimatedDays: { type: Number },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

applicationSchema.index({ project: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
