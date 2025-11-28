const PDFDocument = require("pdfkit");

exports.generateInvoiceBuffer = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // ----------------------------- HEADER -----------------------------
      doc.fontSize(22).text("INVOICE", { align: "center" }).moveDown(1);

      doc.fontSize(12)
        .text("Your Store Name")
        .text("Address Line 1")
        .text("City, India")
        .text("GSTIN: 22AAAAA0000A1Z5")
        .moveDown(1);

      doc.text(`Invoice No: INV-${order._id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Payment ID: ${order.payment.razorpayPaymentId}`);
      doc.moveDown(1);

      // ----------------------------- SHIPPING -----------------------------
      const a = order.shippingAddress;
      doc.fontSize(14).text("Shipping Address", { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text(a.name)
        .text(a.addressLine1)
        .text(a.addressLine2 || "")
        .text(`${a.city}, ${a.state} - ${a.postalCode}`)
        .text(a.country)
        .text(`Phone: ${a.phone}`)
        .moveDown(1.5);

      // ----------------------------- ITEMS TABLE -----------------------------
      doc.fontSize(14).text("Items", { underline: true }).moveDown(0.5);

      doc.fontSize(12);
      doc.text("Product", 50);
      doc.text("Qty", 250);
      doc.text("Price", 300);
      doc.text("Total", 380);
      doc.moveDown(1);

      let subtotal = 0;

      order.items.forEach((item) => {
        const total = item.price * item.quantity;
        subtotal += total;

        doc.text(item.product.name, 50);
        doc.text(String(item.quantity), 250);
        doc.text(`₹${item.price}`, 300);
        doc.text(`₹${total}`, 380);
        doc.moveDown(0.7);
      });

      const gstPercent = 18;
      const gstAmount = (subtotal * gstPercent) / 100;
      const grandTotal = subtotal + gstAmount;

      // ----------------------------- TOTALS -----------------------------
      doc.moveDown(1);
      doc.fontSize(13).text(`Subtotal: ₹${subtotal}`);
      doc.text(`GST (${gstPercent}%): ₹${gstAmount.toFixed(2)}`);
      doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, { underline: true });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
