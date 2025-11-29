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
      // ❗ FIX: Items title aligned with Product column
      doc.fontSize(14).text("Items", 60, undefined, { underline: true }).moveDown(0.5);

      doc.fontSize(12);

      // Column positions
      const colProduct = 60;
      const colQty = 250;
      const colPrice = 320;
      const colTotal = 460;

      // -------- HEADER ROW (LOCK Y) --------
      let headerY = doc.y;

      doc.text("Product", colProduct, headerY);
      doc.text("Qty", colQty, headerY, { width: 40, align: "right" });
      doc.text("Price", colPrice, headerY, { width: 70, align: "right" });
      doc.text("Total", colTotal, headerY, { width: 70, align: "right" });

      doc.moveDown(1.2);

      let subtotal = 0;

      // -------- EACH ITEM ROW --------
      order.items.forEach((item) => {
        const total = item.price * item.quantity;
        subtotal += total;

        let rowY = doc.y;
        const productWidth = colQty - colProduct - 10; // space before Qty column

        // Text with wrapping
        doc.text(item.product.name, colProduct, rowY, {
          width: productWidth,
          align: "left",
        });

        // Get height after text wrapping
        const textHeight = doc.heightOfString(item.product.name, {
          width: productWidth,
        });

        // Draw other columns at same Y
        doc.text(String(item.quantity), colQty, rowY, { width: 40, align: "right" });
        doc.text(`Rs ${item.price}`, colPrice, rowY, { width: 70, align: "right" });
        doc.text(`Rs ${total}`, colTotal, rowY, { width: 70, align: "right" });

        // Move down by actual text height
        doc.y = rowY + textHeight + 5;
        doc.moveDown(0.3);
      });

      // ----------------------------- TOTALS -----------------------------
      const gstPercent = 18;
      const gstAmount = (subtotal * gstPercent) / 100;
      const grandTotal = subtotal + gstAmount;

      doc.moveDown(1);

      const totalsX = 350;      
      const totalsWidth = 200;

      doc.fontSize(13).text(`Subtotal: Rs ${subtotal}`, totalsX, doc.y, {
        width: totalsWidth,
        align: "right",
      });

      doc.text(`GST (${gstPercent}%): Rs ${gstAmount.toFixed(2)}`, totalsX, doc.y, {
        width: totalsWidth,
        align: "right",
      });

      doc.text(`Grand Total: Rs ${grandTotal.toFixed(2)}`, totalsX, doc.y, {
        width: totalsWidth,
        align: "right",
        underline: true,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
