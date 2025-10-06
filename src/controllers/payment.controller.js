const paymentService=require("../services/payment.service.js")

const createPaymentLink = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Validation: Check if orderId is provided
        if (!orderId) {
            return res.status(400).send({ 
                message: "Order ID is required",
                success: false 
            });
        }

        console.log("Payment link request received for order:", orderId);

        const paymentLink = await paymentService.createPaymentLink(orderId);
        
        return res.status(200).send(paymentLink);

    } catch (error) {
        console.error("Error in createPaymentLink controller:", error.message);
        
        // Send appropriate error status based on error message
        if (error.message.includes("not found")) {
            return res.status(404).send({ 
                message: error.message,
                success: false 
            });
        } else if (error.message.includes("Invalid")) {
            return res.status(400).send({ 
                message: error.message,
                success: false 
            });
        } else {
            return res.status(500).send({ 
                message: error.message || "Failed to create payment link",
                success: false 
            });
        }
    }
}

const updatePaymentInformation = async (req, res) => {
    try {
        // Validation: Check if payment_id and order_id are provided
        if (!req.query.payment_id || !req.query.order_id) {
            return res.status(400).send({ 
                message: "Payment ID and Order ID are required",
                success: false 
            });
        }

        console.log("Payment update request received:", {
            payment_id: req.query.payment_id,
            order_id: req.query.order_id
        });

        const result = await paymentService.updatePaymentInformation(req.query);
        
        return res.status(200).send(result);

    } catch (error) {
        console.error("Error in updatePaymentInformation controller:", error.message);
        
        if (error.message.includes("not found")) {
            return res.status(404).send({ 
                message: error.message,
                success: false 
            });
        } else {
            return res.status(500).send({ 
                message: error.message || "Failed to update payment information",
                success: false 
            });
        }
    }
}


module.exports={createPaymentLink,updatePaymentInformation}