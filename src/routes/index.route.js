const express = require('express');
const indexController = require('../controller/index.controller');
const generateInvoice = require('../utils/invoiceGenerator');
const fs = require('fs');
const path = require('path');
const router = express.Router()

const logoPath = path.join(__dirname, '../../public/logohorizontal.svg');
const logoDataUri = `data:image/svg+xml;base64,${fs.readFileSync(logoPath).toString('base64')}`;

router.get("/",indexController.getIndex);
// router.get("/invoice-preview", (req, res) => {
//    res.render("invoice",{ title: "Invoice Preview" });
// });
router.get("/invoice-preview", (req, res) => {
  res.render("invoice", {
    title: "Invoice Preview",
    invoiceDate: "29/11/2025",
    invoiceNumber: "SALI12345",
    companyName: "Saillic Jewels",
    companyAddress: "123, Some Street, City, PIN",
    companyEmail: "support@saillic.com",
    logoUrl: logoDataUri,
    billingName: "Sujith Pillai",
    billingAddress: "Travancore Road, Alappuzha",
    billingCity: "Alappuzha",
    billingState: "Kerala",
    billingZip: "688123",
    shippingName: "Sujith Pillai",
    shippingAddress: "Travancore Road, Alappuzha",
    shippingCity: "Alappuzha",
    shippingState: "Kerala",
    shippingZip: "688123",
    items: [
      { description: "Saillic Basic Necklace with Pendant", qty: 1, unitPrice: 699, subtotal: 699 }
    ],
    subtotal: 699,
    gstRate: 18,
    gst: 125.82,
    total: 699
  });
});

router.get("/invoice-pdf/:orderId", async (req, res) => {
  try {
    const pdfBuffer = await generateInvoice(req.params.orderId, true);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Mystiaura_invoice.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});



module.exports = router