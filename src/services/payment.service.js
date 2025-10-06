const razorpay = require("../config/razorpayClient");
const orderService = require("../services/order.service.js");

const createPaymentLink = async (orderId) => {
    try {
        // VALIDATION: Check if orderId is provided
        if (!orderId) {
            throw new Error("Order ID is required");
        }

        // VALIDATION: Check if orderId is valid MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new Error("Invalid Order ID format");
        }

        console.log("Creating payment link for order ID:", orderId);
        
        // Find order
        const order = await orderService.findOrderById(orderId);
        
        // VALIDATION: Check if order exists
        if (!order) {
            throw new Error(`Order not found with ID: ${orderId}`);
        }

        // VALIDATION: Check if order has required fields
        if (!order.totalPrice) {
            throw new Error("Order total price is missing");
        }

        if (!order.user) {
            throw new Error("Order user information is missing");
        }

        console.log("Order found:", {
            orderId: order._id,
            orderNumber: order.orderNumber,
            totalPrice: order.totalPrice,
            userId: order.user._id
        });

        // Create payment link request
        const paymentLinkRequest = {
            amount: order.totalPrice * 100, // Convert to paise
            currency: 'INR',
            customer: {
                name: `${order.user.firstName} ${order.user.lastName}`,
                contact: order.user.mobile,
                email: order.user.email,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            callback_url: `https://codewithzosh-ecommerce-mern.vercel.app/payment/${orderId}`,
            callback_method: 'get',
        };

        console.log("Creating Razorpay payment link with request:", paymentLinkRequest);

        // Create payment link via Razorpay
        const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

        console.log("Payment link created successfully:", {
            paymentLinkId: paymentLink.id,
            shortUrl: paymentLink.short_url
        });

        const paymentLinkId = paymentLink.id;
        const payment_link_url = paymentLink.short_url;

        // Return response
        const resData = {
            paymentLinkId: paymentLinkId,
            payment_link_url,
        };

        return resData;

    } catch (error) {
        console.error('Error creating payment link:', error);
        throw new Error(error.message);
    }
}

const updatePaymentInformation = async (reqData) => {
    const paymentId = reqData.payment_id;
    const orderId = reqData.order_id;

    try {
        // VALIDATION: Check if payment_id and order_id are provided
        if (!paymentId) {
            throw new Error("Payment ID is required");
        }

        if (!orderId) {
            throw new Error("Order ID is required");
        }

        console.log("Updating payment information:", { paymentId, orderId });

        // Fetch order details
        const order = await orderService.findOrderById(orderId);

        if (!order) {
            throw new Error(`Order not found with ID: ${orderId}`);
        }

        console.log("Order found for payment update:", {
            orderId: order._id,
            currentStatus: order.orderStatus,
            currentPaymentStatus: order.paymentDetails?.status
        });

        // Fetch the payment details using the payment ID
        const payment = await razorpay.payments.fetch(paymentId);

        console.log("Payment fetched from Razorpay:", {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount
        });

        if (payment.status === 'captured') {
            order.paymentDetails.paymentId = paymentId;
            order.paymentDetails.status = 'COMPLETED';
            order.orderStatus = 'PLACED';

            await order.save();

            console.log("Payment updated successfully:", {
                orderId: order._id,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentDetails.status
            });
        } else {
            console.log("Payment not captured. Status:", payment.status);
        }

        const resData = { message: 'Your order is placed', success: true };
        return resData;

    } catch (error) {
        console.error('Error processing payment:', error);
        throw new Error(error.message);
    }
}

module.exports = { createPaymentLink, updatePaymentInformation };