const mongoose = require('mongoose');
const User = require('./User');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, project: 1 }, { unique: true });

reviewSchema.post('save', async function() {
  const reviews = await this.model('Review').find({ reviewee: this.reviewee });
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = sum / reviews.length;
    await User.findByIdAndUpdate(this.reviewee, {
      rating: avgRating,
      reviewCount: reviews.length
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
