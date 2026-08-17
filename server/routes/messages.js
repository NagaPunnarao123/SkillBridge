const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name avatar role')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { recipientId, projectId } = req.body;
    let query = {
      participants: { $all: [req.user.id, recipientId] }
    };
    if (projectId) query.project = projectId;

    let conversation = await Conversation.findOne(query);
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, recipientId],
        project: projectId || null
      });
      await conversation.save();
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: req.params.id }).sort({ createdAt: 1 });
    
    // Mark as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { content } = req.body;
    const message = new Message({
      conversation: req.params.id,
      sender: req.user.id,
      content
    });
    await message.save();

    conversation.lastMessage = content;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/conversations/:id/read', authenticate, async (req, res) => {
  try {
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
