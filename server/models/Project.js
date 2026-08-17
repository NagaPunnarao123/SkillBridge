const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Machine Learning', 'Backend API', 'DevOps', 'Other'] 
  },
  techStack: [{ type: String }],
  budget: { type: Number, required: true },
  budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hiredStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  requirements: { type: String, default: '' },
  deliverables: { type: String, default: '' },
  applicantCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
