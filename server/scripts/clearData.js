const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Review = require('../models/Review');

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Application.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('✅ All MongoDB collections (Users, Clients, Students, Projects, Applications, Conversations, Messages, Reviews) have been completely wiped.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabase();
