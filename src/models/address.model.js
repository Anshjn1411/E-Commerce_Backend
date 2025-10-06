const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  mobile: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model('addresses', addressSchema);

module.exports = Address;