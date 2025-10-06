const express=require("express");
const authenticate = require("../middleware/authenticat.js");
const router=express.Router();
const orderController=require("../controllers/order.controller.js")
const path = require("path");
const fs = require('fs');

router.post("/",authenticate,orderController.createOrder);
router.get("/user",authenticate,orderController.orderHistory);
router.get("/:id",authenticate,orderController.findOrderById);
router.get('/invoice/:orderNumber', (req, res) => {
  const invoicePath = path.join(__dirname, `../invoices/invoice-${req.params.orderNumber}.pdf`);

  if (fs.existsSync(invoicePath)) {
    res.download(invoicePath); // trigger download
  } else {
    res.status(404).json({ message: "Invoice not found." });
  }
});


module.exports=router;