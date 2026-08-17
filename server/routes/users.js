const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();

router.get('/students', async (req, res) => {
  try {
    const { skill, availability, minRating, search, page = 1, limit = 10 } = req.query;
    let query = { role: 'student' };

    if (skill) query.skills = { $in: [skill] };
    if (availability) query.availability = availability;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { bio, skills, github, linkedin, portfolio, college, graduationYear, location, availability, name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (college !== undefined) user.college = college;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (location !== undefined) user.location = location;
    if (availability) user.availability = availability;
    if (name) user.name = name;

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/avatar', authenticate, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    const user = await User.findById(req.user.id);
    user.avatar = '/uploads/' + req.file.filename;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id }).populate('reviewer', 'name avatar');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User account and profile data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
