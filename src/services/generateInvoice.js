const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (order, user, items, address) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  const invoiceDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const filePath = path.join(invoiceDir, `invoice-${order.orderNumber}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // === Colors & Fonts ===
  const primaryColor = '#003049';
  const secondaryColor = '#f77f00';
  const gray = '#666';

  // === Header ===
  doc
    .fillColor(primaryColor)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('INVOICE', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .fillColor('#000')
    .text(`Order No: ${order.orderNumber}`, 50, 90)
    .text(`Order Date: ${order.orderDate.toDateString()}`, 50, 105)
    .text(`Delivery Date: ${order.deliveryDate ? order.deliveryDate.toDateString() : 'N/A'}`, 50, 120);

  // === Company Info ===
  doc
    .fontSize(10)
    .fillColor('#000')
    .text('From:', 400, 90)
    .fillColor(primaryColor)
    .text('E-Shop Pvt. Ltd.', 400, 105)
    .text('www.eshop.com', 400, 120);

  // === Billing Information Box ===
  const billingBoxHeight = 120; // 1.5x original 80px
  doc
    .rect(50, 150, 500, billingBoxHeight)
    .fillOpacity(1)
    .fillAndStroke('#fff8f2', '#ddd'); // light cream background and border

  // === Billing Info Content ===
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Billing Information', 60, 160);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#000') // Ensures visible black text
    .text(`Name: ${address.firstName} ${address.lastName}`, 60, 180)
    .text(`Email: ${user.email}`, 60, 195)
    .text(`Mobile: ${address.mobile}`, 60, 210)
    .text(
      `Shipping Address: ${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}`,
      60,
      225,
      { width: 450 }
    );

  // === Product Table Header ===
  let tableTop = 280;
  doc
    .moveDown(1)
    .fontSize(12)
    .fillColor(primaryColor)
    .text('Order Summary', 50, tableTop);

  const headersY = tableTop + 20;

  doc
    .fillColor('#000')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('No.', 50, headersY)
    .text('Product', 80, headersY)
    .text('Qty', 300, headersY)
    .text('Unit Price', 350, headersY)
    .text('Total', 450, headersY);

  doc
    .moveTo(50, headersY + 15)
    .lineTo(550, headersY + 15)
    .strokeColor('#ccc')
    .stroke();

  let y = headersY + 25;

  items.forEach((item, i) => {
    const product = item.product;
    const totalPrice = item.discountedPrice;

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000')
      .text(i + 1, 50, y)
      .text(product.title, 80, y, { width: 200 })
      .text(item.quantity, 300, y)
      .text(`INR ${product.discountedPrice}`, 350, y)
      .text(`INR ${totalPrice}`, 450, y);
    y += 20;
  });

  // === Summary Box ===
  const gstRate = 0.18;
  const gst = Math.round(order.totalDiscountedPrice * gstRate);
  const grandTotal = order.totalDiscountedPrice + gst;

  y += 30;
  doc
    .fontSize(12)
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .text('Total Summary', 50, y);

  y += 15;
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#000')
    .text(`Subtotal: INR ${order.totalDiscountedPrice}`, 50, y)
    .text(`GST (18%): INR ${gst}`, 50, y + 15)
    .text(`Discount: INR ${order.discounte}`, 50, y + 30)
    .font('Helvetica-Bold')
    .text(`Grand Total: INR ${grandTotal}`, 50, y + 50);

  // === Footer ===
  doc
    .fontSize(9)
    .fillColor(gray)
    .text('Thank you for shopping with us!', 50, 770, { align: 'center' });

  doc.end();
  return filePath;
};

module.exports = generateInvoice;
