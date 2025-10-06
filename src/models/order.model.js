const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    // required: true,
  },
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orderItems',
  }],
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  orderNumber: {
    type: String,
    unique: true,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addresses',
  },
  paymentDetails: {

    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String
    }

  },
  totalPrice: {
    type: Number,
    required: true,
  },
  totalDiscountedPrice: {
    type: Number,
    required: true,
  },
  discounte: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
  },
  totalItem: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', async function (next) {
  // Set orderNumber if not already set
  if (!this.orderNumber) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    this.orderNumber = `ORD${datePart}-${randomPart}`;
  }

  // Set deliveryDate to 7 days after orderDate, if not manually set
  if (!this.deliveryDate) {
    const orderDate = this.orderDate || new Date();
    this.deliveryDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
  }

  next();
});


const Order = mongoose.model('orders', orderSchema);

module.exports = Order;
