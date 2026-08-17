const express = require('express');
const Application = require('../models/Application');
const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { project: projectId, proposal, bidAmount, estimatedDays } = req.body;
    const existing = await Application.findOne({ project: projectId, student: req.user.id });
    if (existing) return res.status(400).json({ error: 'Already applied' });

    const application = new Application({
      project: projectId,
      student: req.user.id,
      proposal,
      bidAmount,
      estimatedDays
    });
    await application.save();

    await Project.findByIdAndUpdate(projectId, { $inc: { applicantCount: 1 } });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const applications = await Application.find({ project: req.params.projectId })
      .populate('student', 'name avatar rating skills college github portfolio completedProjects');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my-applications', authenticate, authorize('student'), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('project', 'title budget deadline status category');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const project = await Project.findById(application.project);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = 'accepted';
    await application.save();

    project.hiredStudent = application.student;
    project.status = 'in-progress';
    await project.save();

    await Application.updateMany(
      { project: project._id, _id: { $ne: application._id } },
      { $set: { status: 'rejected' } }
    );

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/reject', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const project = await Project.findById(application.project);
    if (!project || project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = 'rejected';
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete non-pending application' });
    }

    await Application.findByIdAndDelete(req.params.id);
    await Project.findByIdAndUpdate(application.project, { $inc: { applicantCount: -1 } });
    
    res.json({ message: 'Application removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
