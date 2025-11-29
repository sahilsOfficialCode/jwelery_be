const fs = require("fs");
const path = require("path");
const hbs = require("handlebars");
const puppeteer = require("puppeteer");
const OrderModel = require("../model/Order.model");

/**
 * Generate invoice data and optionally PDF
 * @param {String} orderId - MongoDB Order ID
 * @param {Boolean} generatePdf - true: returns PDF buffer, false: returns HTML string
 * @returns {Buffer|String} PDF buffer or HTML string
 */
async function generateInvoice(orderId, generatePdf = false) {
  // 1️⃣ Fetch order and populate products
  const order = await OrderModel.findById(orderId).populate("items.product");
  if (!order) throw new Error("Order not found");
  // 2️⃣ Prepare items & totals
  const items = order.items.map(item => ({
    description: item.product.name,
    qty: item.quantity,
    unitPrice: item.price,
    subtotal: (item.price * item.quantity).toFixed(2),
  }));

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  // const gstRate = 18;
  // const gst = ((subtotal * gstRate) / 100).toFixed(2);
  const shipping_charge = order.shipping_charge || 0
  const total = shipping_charge+subtotal;

  const billing = order.billingAddress || order.shippingAddress; // fallback

  // 3️⃣ Load layout + invoice template
  const layoutPath = path.join(__dirname, "../views/layouts/layout.hbs");
  const invoicePath = path.join(__dirname, "../views/invoice.hbs");

  const layoutHtml = fs.readFileSync(layoutPath, "utf8");
  const invoiceHtml = fs.readFileSync(invoicePath, "utf8");

  const invoiceTemplate = hbs.compile(invoiceHtml);

  // 4️⃣ Prepare invoice content
  const invoiceContent = invoiceTemplate({
    invoiceDate: new Date().toLocaleDateString(),
    invoiceNumber: `INV-${order._id}`,
    companyName: "MYSTIAURA JEWELS",
    companyAddress: "Calicut beypore Kerala India 673015",
    companyEmail: "mystiaurahelp@gmail.com",

    billingName: billing.name,
    billingAddress: billing.addressLine1,
    billingCity: billing.city,
    billingState: billing.state,
    billingZip: billing.postalCode,

    shippingName: order.shippingAddress.name,
    shippingAddress: order.shippingAddress.addressLine1,
    shippingCity: order.shippingAddress.city,
    shippingState: order.shippingAddress.state,
    shippingZip: order.shippingAddress.postalCode,

    items,
    subtotal: subtotal.toFixed(2),
    // gstRate,
    // gst,
    shipping_charge,
    total,
  });

  // 5️⃣ Inject invoice content into layout
  const layoutTemplate = hbs.compile(layoutHtml);
  const fullHtml = layoutTemplate({
    title: `Invoice INV-${order._id}`,
    body: invoiceContent
  });

  // 6️⃣ Generate PDF if requested
  if (generatePdf) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    await browser.close();
    return pdfBuffer;
  }

  return fullHtml; // for browser preview
}

module.exports = generateInvoice;
