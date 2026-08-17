const express = require('express');
const Review = require('../models/Review');
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('project').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { project: projectId, reviewee, rating, comment } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status !== 'completed') {
      return res.status(400).json({ error: 'Project is not completed' });
    }

    const isClient = project.client.toString() === req.user.id;
    const isStudent = project.hiredStudent && project.hiredStudent.toString() === req.user.id;
    if (!isClient && !isStudent) {
      return res.status(403).json({ error: 'Not authorized to review this project' });
    }

    const revieweeId = reviewee || (isClient ? project.hiredStudent : project.client);

    const existingReview = await Review.findOne({ reviewer: req.user.id, project: projectId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this project' });
    }

    const review = new Review({
      reviewer: req.user.id,
      reviewee: revieweeId,
      project: projectId,
      rating,
      comment
    });
    
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId })
      .populate('reviewer', 'name avatar');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
