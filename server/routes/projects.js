const express = require('express');
const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status = 'open', category, techStack, minBudget, maxBudget, search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (techStack) {
      const stacks = techStack.split(',').map(s => s.trim());
      query.techStack = { $in: stacks };
    }
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('client', 'name avatar rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('client'), async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      client: req.user.id
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/client/my-projects', authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name avatar rating location')
      .populate('hiredStudent', 'name avatar rating');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    project.status = req.body.status;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
