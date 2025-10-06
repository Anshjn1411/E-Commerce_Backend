const  mongoose = require("mongoose");
const Address = require("../models/address.model.js");
const Order = require("../models/order.model.js");
const OrderItem = require("../models/orderItems.js");
const User = require("../models/user.model.js");
const cartService = require("../services/cart.service.js");
const generateInvoice = require('./generateInvoice.js');
const CartItem = require("../models/cartItem.model.js");

async function createOrder(user, shippAddress) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let address;

    if (shippAddress._id) {
      address = await Address.findById(shippAddress._id).session(session);
    } else {
      address = new Address({ ...shippAddress, user: user._id });
      await address.save({ session });
      user.addresses.push(address._id);
      await user.save({ session });
    }

    const cart = await cartService.findUserCart(user._id);
    const orderItems = [];

    for (const item of cart.cartItems) {
      const orderItem = new OrderItem({
        price: item.price,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        userId: item.userId,
        discountedPrice: item.discountedPrice,
      });

      const createdOrderItem = await orderItem.save({ session });
      orderItems.push(createdOrderItem);
    }

    const createdOrder = new Order({
      user: user._id,
      orderItems: orderItems.map(oi => oi._id),
      totalPrice: cart.totalPrice,
      totalDiscountedPrice: cart.totalDiscountedPrice,
      discounte: cart.discounte,
      totalItem: cart.totalItem,
      shippingAddress: address._id,
      orderDate: new Date(),
      orderStatus: "PENDING",
      paymentDetails: {
        paymentStatus: "PENDING",
      },
      createdAt: new Date(),
    });

    const savedOrder = await createdOrder.save({ session });

    // Delete all CartItem documents from the database
    const cartItemIds = cart.cartItems.map(item => item._id);
    await CartItem.deleteMany({ _id: { $in: cartItemIds } }, { session });

    // Clear cart references
    cart.cartItems = [];
    cart.totalPrice = 0;
    cart.totalDiscountedPrice = 0;
    cart.totalItem = 0;
    cart.discounte = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Outside transaction: for safety (e.g., PDF generation doesn't rollback DB)
    const fullUser = await User.findById(user._id);
    const orderItemDetails = await OrderItem.find({ _id: { $in: orderItems.map(oi => oi._id) } }).populate('product');

    await generateInvoice(savedOrder, fullUser, orderItemDetails, address);

    return savedOrder;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order creation failed:", error);
    throw new Error("Order creation failed. Please try again.");
  }
}

async function placedOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "PLACED";
  order.paymentDetails.status = "COMPLETED";
  return await order.save();
}

async function confirmedOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CONFIRMED";
  return await order.save();
}

async function shipOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "SHIPPED";
  return await order.save();
}

async function deliveredOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "DELIVERED";
  return await order.save();
}

async function cancelledOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CANCELLED"; // Assuming OrderStatus is a string enum or a valid string value
  return await order.save();
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate({path:"orderItems", populate:{path:"product"}})
    .populate("shippingAddress");
  
  return order;
}

async function usersOrderHistory(userId) {
  try {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 }) 
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
        },
      })
      .lean();

    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function getAllOrders() {
  return await Order.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    })
    .populate("shippingAddress") 
    .lean();
}


async function deleteOrder(orderId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await findOrderById(orderId);
    if (!order) throw new Error("order not found with id " + orderId);

    // Delete all OrderItem documents associated with this order
    await OrderItem.deleteMany({ _id: { $in: order.orderItems } }, { session });

    // Delete the order itself
    await Order.findByIdAndDelete(orderId, { session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order deletion failed:", error);
    throw new Error("Order deletion failed. Please try again.");
  }
}

module.exports = {
  createOrder,
  placedOrder,
  confirmedOrder,
  shipOrder,
  deliveredOrder,
  cancelledOrder,
  findOrderById,
  usersOrderHistory,
  getAllOrders,
  deleteOrder,
};
