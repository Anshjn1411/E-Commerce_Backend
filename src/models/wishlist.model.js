const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true, // One wishlist per user
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
